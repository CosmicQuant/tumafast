
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { mapService } from '@/services/mapService';
import { useJsApiLoader } from '@react-google-maps/api';
import { APP_CONFIG } from '@/config';
import { GOOGLE_MAPS_LIBRARIES } from '@/constants';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

export type MapOrderState = 'IDLE' | 'DRAFTING' | 'MATCHING' | 'IN_TRANSIT' | 'COMPLETED';

interface Coordinates {
    lat: number;
    lng: number;
}

interface VehicleMarker {
    id: string;
    type: string;
    position: Coordinates;
    bearing?: number;
}

type LocationAccuracy = 'none' | 'cached' | 'low' | 'high';
type SheetDetent = 'default' | 'search' | 'pin';
type SheetPlacement = 'bottom' | 'side';

const LOCATION_CACHE_KEY = 'axon_last_known_location';

interface MapContextType {
    isLoaded: boolean;
    orderState: MapOrderState;
    setOrderState: (state: MapOrderState) => void;

    pickupCoords: Coordinates | null;
    setPickupCoords: (coords: Coordinates | null) => void;

    dropoffCoords: Coordinates | null;
    setDropoffCoords: (coords: Coordinates | null) => void;

    waypointCoords: Coordinates[];
    setWaypointCoords: (coords: Coordinates[]) => void;

    driverCoords: Coordinates | null;
    setDriverCoords: (coords: Coordinates | null) => void;

    driverBearing: number;
    setDriverBearing: (bearing: number) => void;

    driverVehicleType: string;
    setDriverVehicleType: (type: string) => void;

    driverLabel: string | null;
    setDriverLabel: (label: string | null) => void;

    routePolyline: any;
    setRoutePolyline: (polyline: any) => void;

    nearbyVehicles: VehicleMarker[];
    setNearbyVehicles: (vehicles: VehicleMarker[]) => void;

    mapCenter: Coordinates;
    setMapCenter: (lat: number, lng: number) => void;

    zoom: number;
    setZoom: (zoom: number) => void;

    isPanning: boolean;
    setIsPanning: (panning: boolean) => void;

    userLocation: Coordinates | null;
    locationAccuracy: LocationAccuracy;
    requestUserLocation: () => Promise<Coordinates | null>;
    ensureFreshLocation: () => Promise<Coordinates | null>;

    isMapSelecting: boolean;
    setIsMapSelecting: (selecting: boolean) => void;

    activeInput: 'pickup' | 'dropoff' | string | null;
    setActiveInput: (input: 'pickup' | 'dropoff' | string | null) => void;

    allowMarkerClick: boolean;
    setAllowMarkerClick: (allow: boolean) => void;

    bottomSheetHeight: number;
    setBottomSheetHeight: (height: number) => void;

    bottomSheetWidth: number;
    setBottomSheetWidth: (width: number) => void;

    bottomSheetDetent: SheetDetent;
    setBottomSheetDetent: (detent: SheetDetent) => void;

    bottomSheetPlacement: SheetPlacement;
    setBottomSheetPlacement: (placement: SheetPlacement) => void;

    // Commands
    fitBounds: (markers: Coordinates[]) => void;

    // Internal state for triggering map actions
    boundsToFit: Coordinates[] | null;
    resetBoundsTrigger: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

// Helper: read cached location from sessionStorage
const getCachedLocation = (): Coordinates | null => {
    try {
        const cached = sessionStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Only use cache if it's less than 10 minutes old
            if (parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
                return { lat: parsed.lat, lng: parsed.lng };
            }
        }
    } catch { /* ignore */ }
    return null;
};

// Helper: save location to sessionStorage
const cacheLocation = (coords: Coordinates) => {
    try {
        sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
            lat: coords.lat,
            lng: coords.lng,
            timestamp: Date.now()
        }));
    } catch { /* ignore */ }
};

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: APP_CONFIG.GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        version: "beta"
    });

    const [orderState, setOrderState] = useState<MapOrderState>('IDLE');
    const [pickupCoords, setPickupCoordsInternal] = useState<Coordinates | null>(null);
    const [dropoffCoords, setDropoffCoordsInternal] = useState<Coordinates | null>(null);
    const [waypointCoords, setWaypointCoords] = useState<Coordinates[]>([]);
    const [driverCoords, setDriverCoords] = useState<Coordinates | null>(null);
    const [driverBearing, setDriverBearing] = useState<number>(0);
    const [driverVehicleType, setDriverVehicleType] = useState<string>('Truck');
    const [driverLabel, setDriverLabel] = useState<string | null>(null);
    const [routePolyline, setRoutePolyline] = useState<any>(null);
    const [nearbyVehicles, setNearbyVehicles] = useState<VehicleMarker[]>([]);

    // Real-time listener for online drivers to show on map
    useEffect(() => {
        if (!isLoaded) return;

        // Only show nearby vehicles when idle, drafting, or matching
        if (orderState !== 'IDLE' && orderState !== 'DRAFTING' && orderState !== 'MATCHING') {
            setNearbyVehicles([]);
            return;
        }

        const driversRef = collection(db, 'drivers');
        const q = query(driversRef, where('status', '==', 'online'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const vehicles: VehicleMarker[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.location && data.location.lat && data.location.lng) {
                    vehicles.push({
                        id: doc.id,
                        type: data.vehicleType || 'Boda Boda',
                        position: {
                            lat: data.location.lat,
                            lng: data.location.lng
                        },
                        bearing: data.bearing || 0
                    });
                }
            });
            setNearbyVehicles(vehicles);
        }, (error) => {
            console.error("Error listening to drivers:", error);
        });

        return () => unsubscribe();
    }, [isLoaded, orderState]);

    // Auto-clear map data when state becomes IDLE to prevent stale routes
    useEffect(() => {
        if (orderState === 'IDLE') {
            setPickupCoordsInternal(null);
            setDropoffCoordsInternal(null);
            setWaypointCoords([]);
            setRoutePolyline(null);
            setBoundsToFit(null);
        }
    }, [orderState]);

    // Initialize map center from cache immediately (no Nairobi flash)
    const cachedLoc = getCachedLocation();
    const [mapCenter, setMapCenterInternal] = useState<Coordinates>(cachedLoc || { lat: -1.2921, lng: 36.8219 });
    const [zoom, setZoom] = useState(cachedLoc ? 16 : 14);
    const [isPanning, setIsPanning] = useState(false);
    const [boundsToFit, setBoundsToFit] = useState<Coordinates[] | null>(null);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(cachedLoc);
    const [locationAccuracy, setLocationAccuracy] = useState<LocationAccuracy>(cachedLoc ? 'cached' : 'none');
    const [isMapSelecting, setIsMapSelecting] = useState(false);
    const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | string | null>(null);
    const [allowMarkerClick, setAllowMarkerClick] = useState(false);
    const [bottomSheetHeight, setBottomSheetHeight] = useState(0);
    const [bottomSheetWidth, setBottomSheetWidth] = useState(0);
    const [bottomSheetDetent, setBottomSheetDetent] = useState<SheetDetent>('default');
    const [bottomSheetPlacement, setBottomSheetPlacement] = useState<SheetPlacement>('bottom');
    const watchIdRef = useRef<number | null>(null);
    const firstFixAppliedRef = useRef(!!cachedLoc); // True if cache already provided a center
    const lastUserLocationRef = useRef<Coordinates | null>(cachedLoc);
    const freshLocationRequestRef = useRef<Promise<Coordinates | null> | null>(null);

    // Persistent location tracking with watchPosition (Uber/Bolt pattern)
    useEffect(() => {
        if (!navigator.geolocation) return;

        // Minimum distance change (in degrees, ~11m) before updating userLocation
        // This prevents the blue dot from jumping on every noisy GPS reading
        const MIN_MOVE_THRESHOLD = 0.0001; // ~11 meters

        // Start continuous location stream
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const accuracy = position.coords.accuracy;
                const newAccuracy: LocationAccuracy = accuracy <= 50 ? 'high' : 'low';

                // Only update userLocation if moved beyond threshold (prevents marker jitter)
                const prev = lastUserLocationRef.current;
                const moved = !prev || (
                    Math.abs(coords.lat - prev.lat) > MIN_MOVE_THRESHOLD ||
                    Math.abs(coords.lng - prev.lng) > MIN_MOVE_THRESHOLD
                );

                if (moved) {
                    lastUserLocationRef.current = coords;
                    setUserLocation(coords);
                    cacheLocation(coords);
                }

                setLocationAccuracy(newAccuracy);

                // Center the map ONLY on the very first GPS fix (not on every update)
                if (!firstFixAppliedRef.current) {
                    firstFixAppliedRef.current = true;
                    setMapCenterInternal(coords);
                    setBoundsToFit([coords]);
                }
            },
            (error) => {
                console.warn("watchPosition error:", error);
                // On native platform, trigger the full Capacitor pipeline
                // which shows the "Turn on Location Accuracy" native dialog
                if (Capacitor.isNativePlatform() && !lastUserLocationRef.current) {
                    mapService.getCurrentLocation().then(coords => {
                        if (coords) {
                            lastUserLocationRef.current = coords;
                            setUserLocation(coords);
                            setLocationAccuracy('high');
                            cacheLocation(coords);
                            if (!firstFixAppliedRef.current) {
                                firstFixAppliedRef.current = true;
                                setMapCenterInternal(coords);
                                setBoundsToFit([coords]);
                            }
                        } else {
                            setLocationAccuracy('none');
                        }
                    }).catch(() => setLocationAccuracy('none'));
                } else if (!lastUserLocationRef.current) {
                    // Web fallback — single attempt
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            lastUserLocationRef.current = coords;
                            setUserLocation(coords);
                            setLocationAccuracy('low');
                            cacheLocation(coords);
                            if (!firstFixAppliedRef.current) {
                                firstFixAppliedRef.current = true;
                                setMapCenterInternal(coords);
                                setBoundsToFit([coords]);
                            }
                        },
                        () => {
                            if (!lastUserLocationRef.current) setLocationAccuracy('none');
                        },
                        { enableHighAccuracy: false, timeout: 5000 }
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000 // Accept cached positions up to 10s old to reduce jitter
            }
        );

        watchIdRef.current = watchId;

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setPickupCoords = useCallback((coords: Coordinates | null) => {
        setPickupCoordsInternal(prev => {
            if (!prev && !coords) return null;
            if (prev && coords && prev.lat === coords.lat && prev.lng === coords.lng) return prev;
            return coords;
        });
    }, []);

    const setDropoffCoords = useCallback((coords: Coordinates | null) => {
        setDropoffCoordsInternal(prev => {
            if (!prev && !coords) return null;
            if (prev && coords && prev.lat === coords.lat && prev.lng === coords.lng) return prev;
            return coords;
        });
    }, []);

    const setMapCenter = useCallback((lat: number, lng: number) => {
        setMapCenterInternal(prev => {
            if (Math.abs(prev.lat - lat) < 0.000001 && Math.abs(prev.lng - lng) < 0.000001) {
                return prev;
            }
            return { lat, lng };
        });
    }, []);

    const fitBounds = useCallback((markers: Coordinates[]) => {
        setBoundsToFit(markers);
    }, []);

    const resetBoundsTrigger = useCallback(() => {
        setBoundsToFit(null);
    }, []);

    const requestUserLocation = useCallback(async (): Promise<Coordinates | null> => {
        try {
            const coords = await mapService.getCurrentLocation();
            if (coords) {
                setUserLocation(coords);
                setLocationAccuracy('high');
                cacheLocation(coords);
                setMapCenterInternal(coords);
            }
            return coords;
        } catch (error: any) {
            console.error("Error getting location:", error);
            return null;
        }
    }, []);

    // ensureFreshLocation — Bolt/Uber-style warm-start location pipeline.
    //
    // Phase 1 (instant): if we have a cached position, resolve immediately so the
    //   booking UI can pre-fill pickup and center the map without waiting for GPS.
    // Phase 2 (background): always kick off a real GPS fix in parallel.
    //   On Android this triggers cordova.plugins.locationAccuracy.request() which
    //   shows the native "Turn on Location Accuracy" dialog when precision is off.
    //   When the fresh fix arrives we update userLocation + cache automatically.
    //
    // Callers that only need a "good enough" position get the cached result quickly.
    // The map/UI silently upgrades when the fresh fix arrives via setUserLocation.
    const ensureFreshLocation = useCallback(async (): Promise<Coordinates | null> => {
        // De-duplicate: if a request is already in-flight, share it.
        if (freshLocationRequestRef.current) {
            return freshLocationRequestRef.current;
        }

        const requestPromise = (async () => {
            try {
                // Phase 1: Return cached location immediately for visual speed.
                const cached = getCachedLocation();
                if (cached && locationAccuracy !== 'none') {
                    // Start the fresh GPS request in the background — don't await yet.
                    mapService.getCurrentLocation().then(freshCoords => {
                        if (freshCoords) {
                            setUserLocation(freshCoords);
                            setLocationAccuracy('high');
                            cacheLocation(freshCoords);
                            // Only move the map if no booking coords are set yet
                            // (don't interrupt in-progress route building)
                            setMapCenterInternal(prev => {
                                const hasBookingPoints =
                                    lastUserLocationRef.current &&
                                    Math.abs(prev.lat - lastUserLocationRef.current.lat) > 0.001;
                                if (!hasBookingPoints) return freshCoords;
                                return prev;
                            });
                            lastUserLocationRef.current = freshCoords;
                        }
                    }).catch(() => { /* Background refresh failed — cached pos still valid */ });
                    return cached;
                }

                // Phase 2: No usable cache — get precise location (may show OS prompt).
                const coords = await mapService.getCurrentLocation();
                if (coords) {
                    setUserLocation(coords);
                    setLocationAccuracy('high');
                    cacheLocation(coords);
                    setMapCenterInternal(coords);
                    lastUserLocationRef.current = coords;
                    if (!firstFixAppliedRef.current) {
                        firstFixAppliedRef.current = true;
                        setBoundsToFit([coords]);
                    }
                } else {
                    setLocationAccuracy('none');
                }
                return coords;
            } catch (error) {
                console.warn("ensureFreshLocation failed:", error);
                setLocationAccuracy('none');
                return null;
            } finally {
                freshLocationRequestRef.current = null;
            }
        })();

        freshLocationRequestRef.current = requestPromise;
        return requestPromise;
    }, [locationAccuracy]);

    // Automatic Routing Effect - Removed to allow pages to control routing logic (e.g. driver-to-destination)
    /*
    useEffect(() => {
        const fetchRoute = async () => {
            if (pickupCoords && dropoffCoords) {
                const routeData = await mapService.getRoute(pickupCoords, dropoffCoords);
                if (routeData) {
                    setRoutePolyline(routeData.geometry);
                }
            } else {
                setRoutePolyline(null);
            }
        };
        fetchRoute();
    }, [pickupCoords, dropoffCoords]);
    */

    return (
        <MapContext.Provider value={{
            isLoaded,
            orderState,
            setOrderState,
            pickupCoords,
            setPickupCoords,
            dropoffCoords,
            setDropoffCoords,
            driverCoords,
            setDriverCoords,
            driverBearing,
            setDriverBearing,
            driverVehicleType,
            setDriverVehicleType,
            routePolyline,
            setRoutePolyline,
            nearbyVehicles,
            setNearbyVehicles,
            mapCenter,
            setMapCenter,
            zoom,
            setZoom,
            isPanning,
            setIsPanning,
            fitBounds,
            boundsToFit,
            resetBoundsTrigger,
            userLocation,
            locationAccuracy,
            requestUserLocation,
            ensureFreshLocation,
            isMapSelecting,
            setIsMapSelecting,
            activeInput,
            setActiveInput,
            allowMarkerClick,
            setAllowMarkerClick,
            bottomSheetHeight,
            setBottomSheetHeight,
            bottomSheetWidth,
            setBottomSheetWidth,
            bottomSheetDetent,
            setBottomSheetDetent,
            bottomSheetPlacement,
            setBottomSheetPlacement,
            waypointCoords,
            setWaypointCoords,
            driverLabel,
            setDriverLabel
        }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMapState = () => {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw new Error('useMapState must be used within a MapProvider');
    }
    return context;
};
