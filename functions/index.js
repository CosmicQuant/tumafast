const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const cors = require("cors")({ origin: true });

// ── UNIFIED PRICING MODEL (Single Source of Truth) ──────────────
// All prices in KES. Base fare covers first 2km.
// Rates calibrated to 2026 Kenya market:
//   Nairobi–Mombasa (~480km) small parcel Standard ≈ 300–600 KES
//   Nairobi–Mombasa Boda N/A (65km max), Probox ≈ 30k, Lorry-10T ≈ 85k
const VEHICLE_RATES = {
    // Light / Parcels
    'boda': { base: 100, perKm: 22, perMin: 2, stopFee: 30, min: 100 },
    'tuktuk': { base: 180, perKm: 35, perMin: 3, stopFee: 50, min: 180 },
    'probox': { base: 500, perKm: 50, perMin: 8, stopFee: 80, min: 500 },
    'van': { base: 800, perKm: 65, perMin: 12, stopFee: 120, min: 800 },
    'pickup': { base: 1000, perKm: 75, perMin: 14, stopFee: 150, min: 1000 },

    // Medium trucks
    'canter': { base: 2000, perKm: 95, perMin: 18, stopFee: 250, min: 2000 },

    // Lorry tonnage variants
    'lorry-5t': { base: 3000, perKm: 115, perMin: 20, stopFee: 350, min: 3000 },
    'lorry-7t': { base: 3500, perKm: 130, perMin: 22, stopFee: 400, min: 3500 },
    'lorry-10t': { base: 4500, perKm: 155, perMin: 25, stopFee: 500, min: 4500 },
    'lorry-14t': { base: 6000, perKm: 185, perMin: 30, stopFee: 600, min: 6000 },

    // Tipper tonnage variants
    'tipper-7t': { base: 3500, perKm: 120, perMin: 20, stopFee: 400, min: 3500 },
    'tipper-14t': { base: 5000, perKm: 160, perMin: 25, stopFee: 500, min: 5000 },
    'tipper-25t': { base: 7000, perKm: 200, perMin: 30, stopFee: 600, min: 7000 },

    // Container sizes
    'container-20ft': { base: 8000, perKm: 180, perMin: 35, stopFee: 700, min: 8000 },
    'container-40ft': { base: 12000, perKm: 250, perMin: 45, stopFee: 900, min: 12000 },

    // Tanker types (LPG vs Petroleum — different pricing)
    'lpg-tanker': { base: 10000, perKm: 220, perMin: 40, stopFee: 800, min: 10000 },
    'fuel-tanker': { base: 12000, perKm: 270, perMin: 45, stopFee: 1000, min: 12000 },

    // Legacy IDs (backward compatibility with existing orders)
    'lorry': { base: 4500, perKm: 155, perMin: 25, stopFee: 500, min: 4500 },
    'tipper': { base: 5000, perKm: 160, perMin: 25, stopFee: 500, min: 5000 },
    'container': { base: 8000, perKm: 180, perMin: 35, stopFee: 700, min: 8000 },
    'tanker': { base: 12000, perKm: 270, perMin: 45, stopFee: 1000, min: 12000 },
    'trailer': { base: 12000, perKm: 250, perMin: 45, stopFee: 900, min: 12000 },

    // Standard consolidated (no dedicated vehicle — affordable parcel rate)
    'standard': { base: 100, perKm: 1.0, perMin: 0, stopFee: 20, min: 80 },
};

// Express = baseline, Standard = 25% discount (batch consolidation margin)
const SERVICE_MULTIPLIERS = { 'Standard': 0.75, 'Express': 1.0 };
const HELPER_FEE = 500;
const RETURN_TRIP_MULTIPLIER = 1.7;
const FRAGILE_SURCHARGE = 200;

// Google Maps API key for server-side Routes API calls
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY || '';

// ── Routes API V2 — Real distance + duration ───────────────────
async function getRouteFromGoogleV2(origin, destination, waypoints = [], vehicleType = 'boda') {
    const normalized = (vehicleType || '').toLowerCase();
    let travelMode = 'DRIVE';
    let routingPreference = 'TRAFFIC_AWARE_OPTIMAL';

    if (normalized.includes('boda') || normalized.includes('moto') || normalized.includes('tuk')) {
        travelMode = 'TWO_WHEELER';
        routingPreference = 'TRAFFIC_AWARE';
    }

    const requestBody = {
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        intermediates: (waypoints || []).map(w => ({
            location: { latLng: { latitude: w.lat, longitude: w.lng } }
        })),
        travelMode,
        routingPreference,
        computeAlternativeRoutes: false,
        routeModifiers: { avoidTolls: false, avoidHighways: false, avoidFerries: true },
        units: 'METRIC',
        languageCode: 'en-US'
    };

    const fieldMask = 'routes.duration,routes.distanceMeters,routes.legs';

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
            'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Routes API error:', errorData);
        return null;
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const parseDuration = (dur) => dur ? parseInt(dur.replace('s', ''), 10) : 0;

    return {
        distanceMeters: route.distanceMeters || 0,
        durationSeconds: parseDuration(route.duration),
        legs: (route.legs || []).map(leg => ({
            distanceMeters: leg.distanceMeters || 0,
            durationSeconds: parseDuration(leg.duration)
        }))
    };
}

// ── Haversine fallback (if Routes API key not configured) ──────
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── UNIFIED PRICE FORMULA ──────────────────────────────────────
function computePrice({ distanceKm, durationMinutes, vehicle, serviceType, helpersCount = 0, isReturnTrip = false, isFragile = false, stopCount = 0 }) {
    const rates = VEHICLE_RATES[vehicle] || VEHICLE_RATES['boda'];
    const multiplier = SERVICE_MULTIPLIERS[serviceType] || 1.0;

    const billableKm = Math.max(0, distanceKm - 2); // first 2km included in base
    const extraStopFee = Math.max(0, stopCount) * rates.stopFee;
    const intercitySurcharge = distanceKm > 100 ? (rates.base * 0.5) : 0;

    let total = (rates.base + (billableKm * rates.perKm) + (durationMinutes * rates.perMin) + extraStopFee + intercitySurcharge) * multiplier;

    if (isReturnTrip) total *= RETURN_TRIP_MULTIPLIER;
    total += helpersCount * HELPER_FEE;
    if (isFragile) total += FRAGILE_SURCHARGE;

    total = Math.max(total, rates.min * multiplier);
    return Math.round(total / 10) * 10; // round to nearest 10 KES
}

// ── CALLABLE CLOUD FUNCTION ────────────────────────────────────
exports.calculateQuote = functions.https.onCall(async (data, context) => {
    const { pickupCoords, dropoffCoords, waypoints = [], vehicle, serviceType, helpersCount = 0, isReturnTrip = false, isFragile = false } = data;

    if (!pickupCoords || !dropoffCoords || !vehicle) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required coordinates or vehicle type.');
    }

    const rates = VEHICLE_RATES[vehicle];
    if (!rates) {
        throw new functions.https.HttpsError('invalid-argument', `Unsupported vehicle type: ${vehicle}`);
    }

    // Count extra stops (waypoints excluding dropoff)
    const stopCount = Array.isArray(waypoints) ? waypoints.length : 0;

    let distanceKm, durationMinutes;

    // Try real Routes API V2 first
    if (GOOGLE_MAPS_KEY) {
        try {
            const routeResult = await getRouteFromGoogleV2(pickupCoords, dropoffCoords, waypoints, vehicle);
            if (routeResult) {
                distanceKm = routeResult.distanceMeters / 1000;
                durationMinutes = routeResult.durationSeconds / 60;
            }
        } catch (err) {
            console.warn('Routes API call failed, falling back to Haversine:', err.message);
        }
    }

    // Fallback: Haversine × routing factor
    if (!distanceKm) {
        distanceKm = haversineKm(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng) * 1.3;
        durationMinutes = (distanceKm / 35) * 60; // estimate at 35km/h
    }

    if (distanceKm < 1) distanceKm = 1;

    const finalPrice = computePrice({
        distanceKm, durationMinutes, vehicle, serviceType,
        helpersCount, isReturnTrip, isFragile, stopCount
    });

    // Driver payout = 80% of fare
    const driverRate = Math.max(100, Math.round(finalPrice * 0.8));

    const quoteId = `QT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60000);

    await admin.firestore().collection('quotes').doc(quoteId).set({
        pickupCoords, dropoffCoords, waypoints,
        vehicle, serviceType, helpersCount, isReturnTrip, isFragile,
        distanceKm: Number(distanceKm.toFixed(1)),
        durationMinutes: Number(durationMinutes.toFixed(1)),
        price: finalPrice, driverRate,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        status: 'active'
    });

    const multiplier = SERVICE_MULTIPLIERS[serviceType] || 1.0;
    const billableKm = Math.max(0, distanceKm - 2);

    return {
        quoteId,
        price: finalPrice,
        driverRate,
        distanceKm: Number(distanceKm.toFixed(1)),
        durationMinutes: Number(durationMinutes.toFixed(1)),
        breakdown: {
            baseFare: rates.base,
            distanceFare: Math.round(billableKm * rates.perKm),
            timeFare: Math.round(durationMinutes * rates.perMin),
            stopFees: stopCount * rates.stopFee,
            helpersFee: helpersCount * HELPER_FEE,
            fragileFee: isFragile ? FRAGILE_SURCHARGE : 0,
            serviceMultiplier: multiplier,
            returnTripMultiplier: isReturnTrip ? RETURN_TRIP_MULTIPLIER : 1.0
        },
        expiresAt: expiresAt.toISOString()
    };
});


// --- API & WEBHOOKS MODULE ---
const apiV1 = require('./v1/api');
exports.v1 = functions.https.onRequest(apiV1);
