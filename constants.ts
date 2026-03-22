export const LOCATION_COORDINATES: Record<string, [number, number]> = {
    'Nairobi CBD': [-1.2841, 36.8155],
    'Westlands': [-1.2682, 36.8117],
    'Kilimani': [-1.2924, 36.7845],
    'Upper Hill': [-1.2970, 36.8136],
    'Industrial Area': [-1.3130, 36.8400],
    'JKIA': [-1.3283, 36.9242],
    'Mombasa Road': [-1.3418, 36.8924],
    'Thika Road': [-1.2227, 36.8929],
    'Karen': [-1.3197, 36.7067],
    'Langata': [-1.3667, 36.7667],
    'Eastleigh': [-1.2721, 36.8524],
    'Parklands': [-1.2608, 36.8248]
};

export const LOGISTICS_HUBS = {
    NAIROBI: { lat: -1.286389, lng: 36.817223, name: 'Axon CBD Hub (Nairobi)' },
    MOMBASA: { lat: -4.043477, lng: 39.668206, name: 'Mombasa Regional Hub' },
    KISUMU: { lat: -0.102213, lng: 34.761714, name: 'Kisumu Regional Hub' }
};

export const LOGISTICS_ZONES = {
    ZONE_1_MAX: 15000, // 15km
    ZONE_2_MAX: 35000, // 35km
    ZONE_3_MAX: 65000, // 65km
    INTERCOUNTY_THRESHOLD: 65000
};

export const GOOGLE_MAPS_LIBRARIES: any = ['places', 'geometry', 'routes'];

export const VEHICLE_TYPES = {
    BODA: 'Boda Boda',
    TUKTUK: 'Tuk Tuk',
    CAR: 'Car',
    TRUCK: 'Small Truck',
    PICKUP: 'Pickup'
};

export const SERVICE_TYPES = {
    STANDARD: 'Standard',
    EXPRESS: 'Express'
};
