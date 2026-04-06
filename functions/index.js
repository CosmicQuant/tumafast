const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const cors = require("cors")({ origin: true });

// ── UNIFIED PRICING MODEL (Single Source of Truth) ──────────────
// All prices in KES. Base fare covers first 2km.
const VEHICLE_RATES = {
    'boda': { base: 150, perKm: 25, perMin: 3, stopFee: 30, min: 150 },
    'tuktuk': { base: 250, perKm: 35, perMin: 5, stopFee: 50, min: 250 },
    'probox': { base: 600, perKm: 55, perMin: 10, stopFee: 80, min: 600 },
    'pickup': { base: 800, perKm: 65, perMin: 12, stopFee: 100, min: 800 },
    'van': { base: 1200, perKm: 85, perMin: 18, stopFee: 150, min: 1200 },
    'canter': { base: 2500, perKm: 120, perMin: 22, stopFee: 300, min: 2500 },
    'lorry': { base: 3500, perKm: 140, perMin: 25, stopFee: 400, min: 3500 },
    'tipper': { base: 4000, perKm: 160, perMin: 28, stopFee: 500, min: 4000 },
    'container': { base: 8000, perKm: 250, perMin: 40, stopFee: 700, min: 8000 },
    'tanker': { base: 10000, perKm: 280, perMin: 45, stopFee: 800, min: 10000 },
    'trailer': { base: 12000, perKm: 280, perMin: 45, stopFee: 800, min: 12000 },
    'standard': { base: 150, perKm: 20, perMin: 2, stopFee: 20, min: 120 },
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
