import { APP_CONFIG } from './config';
import { mapService } from './services/mapService';

// Ensure we have an API Key from the environment
APP_CONFIG.GOOGLE_MAPS_API_KEY = process.env.VITE_FIREBASE_API_KEY || APP_CONFIG.GOOGLE_MAPS_API_KEY || '';

// If a referer is required for your API key, uncomment the following code:
/*
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
    if (options && options.headers) {
        options.headers = { ...options.headers, 'Referer': 'http://localhost:5173' };
    }
    return originalFetch(url, options);
};
*/

// Mock google object to bypass the window.google checks
(globalThis as any).google = { maps: {} };

async function testFullyOptimizedRoute() {
    // Mock coordinates (CBD as start, and 2 stops)
    const start = { lat: -1.286389, lng: 36.817223 };
    const allStops = [
        { lat: -1.2921, lng: 36.8219 }, // stop 1
        { lat: -1.3000, lng: 36.8300 }  // stop 2
    ];

    console.log('Testing getFullyOptimizedRoute with 2 stops...');

    try {
        const result = await mapService.getFullyOptimizedRoute(start, allStops, 'car');
        console.log('\nFinal Optimized Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Test Failed Exception:', e);
    }
}

testFullyOptimizedRoute();
