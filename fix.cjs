const fs = require('fs');
let text = fs.readFileSync('components/MapLayer.tsx', 'utf8');

text = text.replace('center={mapCenter || center}', 'center={undefined}\n                zoom={undefined}');
if (!text.includes('isFractionalZoomEnabled: true')) {
    text = text.replace('options={{', 'options={{\n                    isFractionalZoomEnabled: true,\n                    mapId: "DEMO_MAP_ID",');
}

const n1 = text.indexOf('const onLoad = useCallback(function callback(map: google.maps.Map) {');
const n2 = text.indexOf('}, []);', n1) + 7;
if (n1 !== -1) {
    const new_load = \const initialCenterSet = useRef(false);
    const onLoad = useCallback(function callback(mapInstance) {
        if (!initialCenterSet.current && mapCenter) {
            mapInstance.setCenter(userLocation || mapCenter);
            mapInstance.setZoom(userLocation ? 14 : zoom);
            initialCenterSet.current = true;
        }
        setMap(mapInstance);
    }, [mapCenter, zoom, userLocation]);\;
    text = text.substring(0, n1) + new_load + text.substring(n2);
}

const i1 = text.indexOf('const onIdle = () => {');
const i2 = text.indexOf('};', text.indexOf('wasPanned.current = false;', i1)) + 2;
if (i1 !== -1) {
    const new_idle = \const onIdle = useCallback(() => {
        if (isMapAnimatingRef.current) return;
        if (!map) return;
        const currentZoom = map.getZoom();
        if (currentZoom !== undefined && currentZoom !== zoom) {
            setZoom(currentZoom);
        }
        const c = map.getCenter();
        if (c) {
            setMapCenter(c.lat(), c.lng());
        }
    }, [map, zoom, setZoom, setMapCenter]);\;
    text = text.substring(0, i1) + new_idle + text.substring(i2);
}

const b1 = text.indexOf('useEffect(() => {\\n        if (map && boundsToFit && boundsToFit.length > 0) {\\n            const PADDING');
const b2 = text.indexOf('}, [map, boundsToFit, resetBoundsTrigger]);', b1) + 43;
if (b1 !== -1) {
    const new_bounds = \const lastBoundsRef = useRef('');
    const cameraTimeoutsRef = useRef([]);

    useEffect(() => {
        if (map && boundsToFit && boundsToFit.length > 0) {
            const dynamicPadding = { top: 96, bottom: 400, left: 56, right: 56 };
            const boundsKey = JSON.stringify(boundsToFit);
            
            if (boundsKey === lastBoundsRef.current) {
                resetBoundsTrigger();
                return;
            }

            lastBoundsRef.current = boundsKey;

            cameraTimeoutsRef.current.forEach(t => clearTimeout(t));
            cameraTimeoutsRef.current = [];
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const animateCamera = (targetCenter, targetZoom, durationMs, onComplete) => {
                const startZoom = map.getZoom() || 14;
                const startCenter = map.getCenter();
                if (!startCenter) return;

                const startLat = startCenter.lat();
                const startLng = startCenter.lng();
                const startTime = performance.now();

                isMapAnimatingRef.current = true;
                const tick = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / durationMs, 1);
                    const ease = easeInOutCubic(progress);

                    map.setZoom(startZoom + (targetZoom - startZoom) * ease);
                    map.setCenter({
                        lat: startLat + (targetCenter.lat - startLat) * ease,
                        lng: startLng + (targetCenter.lng - startLng) * ease
                    });

                    if (progress < 1) {
                        animationFrameRef.current = requestAnimationFrame(tick);
                    } else {
                        isMapAnimatingRef.current = false;
                        if (onComplete) onComplete();
                    }
                };
                animationFrameRef.current = requestAnimationFrame(tick);
            };

            const applyCamera = () => {
                if (boundsToFit.length === 1) {
                    animateCamera(boundsToFit[0], 19, 1200, () => {
                        resetBoundsTrigger();
                    });
                } else {
                    const bounds = new google.maps.LatLngBounds();
                    boundsToFit.forEach(coord => bounds.extend(coord));
                    if (map.panToBounds) {
                        map.panToBounds(bounds, dynamicPadding);
                    } else {
                        map.fitBounds(bounds, dynamicPadding);
                    }
                    setTimeout(() => {
                        resetBoundsTrigger();
                    }, 1200);
                }
            };

            const t = setTimeout(applyCamera, 200);
            cameraTimeoutsRef.current.push(t);
        }
    }, [map, boundsToFit, resetBoundsTrigger]);

    useEffect(() => {
        return () => {
            cameraTimeoutsRef.current.forEach(t => clearTimeout(t));
        };
    }, []);\;
    text = text.substring(0, b1) + new_bounds + text.substring(b2);
} else {
    console.log("Could not find bounds regex!");
}

const r1 = text.indexOf('    const userPannedRef = useRef(false);\\n');
if (r1 !== -1) {
    text = text.replace('    const userPannedRef = useRef(false);\\n', '');
}
const r2 = text.indexOf('    const wasPanned = useRef(false);\\n');
if (r2 !== -1) {
    text = text.replace('    const wasPanned = useRef(false);\\n', '');
}

fs.writeFileSync('components/MapLayer.tsx', text);
console.log("DONE!");
