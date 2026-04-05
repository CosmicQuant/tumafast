
const fs = require('fs');
const file = 'components/MapLayer.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('isFractionalZoomEnabled: true,', 'isFractionalZoomEnabled: true,\n                    mapId: \'DEMO_MAP_ID\',');

data = data.replace(
    /const applyCamera = \(\) => \{[\s\S]*?            \};\n\n            if \(isFirstLoad\) \{/,
    \const applyCamera = () => {
                if (boundsToFit.length === 1) {
                    const target = boundsToFit[0];
                    animateCamera(target, 19, 1200, () => {
                        userPannedRef.current = false;
                        resetBoundsTrigger();
                    });
                } else {
                    const bounds = new google.maps.LatLngBounds();
                    boundsToFit.forEach(coord => bounds.extend(coord));
                    
                    // Native panToBounds for smoothly framing multiple pins
                    // Since Vector Maps (mapId) is enabled, this is buttery smooth without manual math loops.
                    map.panToBounds(bounds, dynamicPadding);
                    
                    // Clear the bounds trigger after the native pan has time to finish
                    setTimeout(() => {
                        userPannedRef.current = false;
                        resetBoundsTrigger();
                    }, 1200);
                }
            };

            if (isFirstLoad) {\
);

data = data.replace(
    /if \(isFirstLoad\) \{[\s\S]*?                const t = setTimeout\(applyCamera, 500\);\n                cameraTimeoutsRef\.current\.push\(t\);\n            \} else \{/,
    \if (isFirstLoad) {
                const t = setTimeout(applyCamera, 200);
                cameraTimeoutsRef.current.push(t);
            } else {\
);

fs.writeFileSync(file, data);
