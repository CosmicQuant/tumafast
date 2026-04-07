import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { useMapState } from '../context/MapContext';
import { Capacitor } from '@capacitor/core';

const LocationBlocker: React.FC = () => {
    const { ensureFreshLocation, locationAccuracy } = useMapState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoAttempted, setAutoAttempted] = useState(false);
    const [isDenied, setIsDenied] = useState(false);
    const autoAttemptStartedRef = useRef(false);

    // Check browser permission state
    useEffect(() => {
        if (Capacitor.isNativePlatform()) return;
        navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then(perm => {
            setIsDenied(perm.state === 'denied');
            perm.onchange = () => {
                setIsDenied(perm.state === 'denied');
                if (perm.state === 'granted') {
                    // Permission just got unblocked — retry automatically
                    handleEnableLocation(true);
                }
            };
        }).catch(() => { });
    }, []);

    const handleEnableLocation = async (silent = false) => {
        setIsLoading(true);
        if (!silent) setError(null);
        try {
            const coords = await ensureFreshLocation();
            if (!coords) {
                setAutoAttempted(true);
                setError("The system location prompt was attempted but precise location is still off. Turn on Device Location and Location Accuracy, then retry.");
            }
        } catch (err: any) {
            setAutoAttempted(true);
            setError("Please ensure GPS is on. If using a browser, click the lock icon in the URL bar to allow location access, then refresh.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (locationAccuracy !== 'none') {
            setError(null);
            setAutoAttempted(false);
            autoAttemptStartedRef.current = false;
            return;
        }

        if (!autoAttemptStartedRef.current) {
            autoAttemptStartedRef.current = true;
            handleEnableLocation(true);
        }
    }, [locationAccuracy]);

    if (locationAccuracy !== 'none') return null;
    if (!autoAttempted && isLoading) return null;
    if (!autoAttempted && Capacitor.isNativePlatform()) return null;

    return (
        <div className="absolute inset-0 z-[300] bg-white flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-brand-100 rounded-full blur-xl scale-150 animate-pulse"></div>
                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-xl">
                    <MapPin className="w-10 h-10 text-brand-600" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
                Precise Location Required
            </h2>

            <p className="text-gray-500 mb-8 max-w-sm text-sm leading-relaxed">
                To provide accurate estimates and reliable routing, your device needs precise location. We already tried to open the system prompt automatically.
            </p>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3 text-left w-full max-w-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {isDenied && !Capacitor.isNativePlatform() && (
                <div className="mb-6 bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium border border-amber-200 flex items-start gap-3 text-left w-full max-w-sm">
                    <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>Location is blocked in your browser. Click the <strong>lock/site settings icon</strong> in the URL bar, set Location to <strong>Allow</strong>, then refresh this page.</span>
                </div>
            )}

            <button
                onClick={() => handleEnableLocation()}
                disabled={isLoading}
                className="w-full max-w-sm bg-brand-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-brand-700 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Locating...</span>
                    </>
                ) : (
                    <span>Turn On Exact Location</span>
                )}
            </button>
        </div>
    );
};

export default LocationBlocker;
