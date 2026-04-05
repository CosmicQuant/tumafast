const fs = require('fs');

const file = 'components/MapLayer.tsx';
let data = fs.readFileSync(file, 'utf8');

const regex = /            const isFirstLoad \= \!lastBoundsRef\.current\;[\s\S]*?            \} else \{\n                applyCamera\(\);\n            \}\n        \}/g;

const replacement = `            const isFirstLoad = !lastBoundsRef.current;
            lastBoundsRef.current = boundsKey;

            // Clear any in-flight camera animations
            cameraTimeoutsRef.current.forEach(t => clearTimeout(t));
            cameraTimeoutsRef.current = [];
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Fractional cinematic glide engine (60fps)
            const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const animateCamera = (targetCenter: { lat: number, lng: number }, targetZoom: number, durationMs: number, onComplete?: () => void) => {
                const startZoom = map.getZoom() || 14;
                const startCenter = map.getCenter();
                if (!startCenter) return;

                const startLat = startCenter.lat();
                const startLng = startCenter.lng();
                const startTime = performance.now();

                const tick = (currentTime: number) => {
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
                        if (onComplete) onComplete();
                    }
                };
                animationFrameRef.current = requestAnimationFrame(tick);
            };

            const applyCamera = () => {
                if (boundsToFit.length === 1) {
                    const target = boundsToFit[0];
                    animateCamera(target, 19, 1200, () => {
                        userPannedRef.current = false;
                        resetBoundsTrigger();
                    });
                } else {
                    const bounds = new google.maps.LatLngBounds();
                    boundsToFit.forEach(coord => bounds.extend(coord));
                    const center = bounds.getCenter();
                    
                    // To prevent mapping snaps, calculate midpoint and zoom out smoothly,
                    // THEN snap fitBounds. The delta is microscopic by then so it glides natively.
                    const currentZoom = map.getZoom() || 14;
                    // Move upwards smoothly if tight zoom
                    const overviewZoom = Math.max(currentZoom - 3, 12); 
                    
                    animateCamera({ lat: center.lat(), lng: center.lng() }, Math.min(currentZoom, overviewZoom), 600, () => {
                        map.fitBounds(bounds, dynamicPadding);
                        userPannedRef.current = false;
                        resetBoundsTrigger();
                    });
                }
            };

            if (isFirstLoad) {
                // Initialize high above the destination so the native Web map engine 
                // drone strikes downwards directly.
                let startPos = boundsToFit[0];
                if (boundsToFit.length > 1) {
                    const b = new google.maps.LatLngBounds();
                    boundsToFit.forEach(c => b.extend(c));
                    const c = b.getCenter();
                    startPos = { lat: c.lat(), lng: c.lng() };
                }
                
                map.setCenter(startPos);
                map.setZoom(14);
                
                const t = setTimeout(applyCamera, 500);
                cameraTimeoutsRef.current.push(t);
            } else {
                applyCamera();
            }
        }`;

const newData = data.replace(regex, replacement);
if (newData !== data) {
    fs.writeFileSync(file, newData);
    console.log("Successfully injected fractional loop");
} else {
    console.log("Regex didn't match");
}
