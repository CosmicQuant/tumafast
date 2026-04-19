import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useMapState } from '../context/MapContext';
import { Capacitor } from '@capacitor/core';

const LocationBlocker: React.FC = () => {
    const { ensureFreshLocation, locationAccuracy } = useMapState();

    // Retry location whenever this component is visible
    // Covers: user enabling location via system settings, then switching back
    useEffect(() => {
        if (locationAccuracy !== 'none') return;

        // Attempt immediately
        ensureFreshLocation().catch(() => { });

        // Poll every 3s while blocker is showing (catches OS-level enable)
        const interval = setInterval(() => {
            ensureFreshLocation().catch(() => { });
        }, 3000);

        // Also retry when tab becomes visible (user returns from settings)
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                ensureFreshLocation().catch(() => { });
            }
        };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [locationAccuracy]);

    // Check browser permission — auto-retry when user unblocks
    useEffect(() => {
        if (Capacitor.isNativePlatform()) return;
        navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then(perm => {
            perm.onchange = () => {
                if (perm.state === 'granted') {
                    ensureFreshLocation().catch(() => { });
                }
            };
        }).catch(() => { });
    }, []);

    if (Capacitor.isNativePlatform()) return null;
    if (locationAccuracy !== 'none') return null;

    return (
        <div className="absolute inset-0 z-[300] bg-white flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-brand-100 rounded-full blur-xl scale-150 animate-pulse"></div>
                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-xl">
                    <MapPin className="w-10 h-10 text-brand-600" />
                </div>
            </div>

            <p className="text-gray-700 max-w-xs text-base font-semibold leading-relaxed">
                Location is blocked in your browser. Please switch on location, then refresh the page.
            </p>
        </div>
    );
};

export default LocationBlocker;
