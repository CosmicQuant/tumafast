import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useMapState } from '../context/MapContext';
import { Capacitor } from '@capacitor/core';

const LocationBlocker: React.FC = () => {
    const { ensureFreshLocation, locationAccuracy } = useMapState();
    const [showBlocker, setShowBlocker] = React.useState(false);

    // Prevent immediate flash before the map context even attempts a fetch
    useEffect(() => {
        if (locationAccuracy === 'none') {
            const t = setTimeout(() => setShowBlocker(true), 800);
            return () => clearTimeout(t);
        } else {
            setShowBlocker(false);
        }
    }, [locationAccuracy]);

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
    if (!showBlocker) return null;

    return null;
};

export default LocationBlocker;
