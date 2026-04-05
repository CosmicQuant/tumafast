const fs = require('fs');
let code = fs.readFileSync('components/MapLayer.tsx', 'utf8');

// Remove styles string to fix console error
code = code.replace(/styles:\s*\[\s*\]\n?/, '');

const effectStartRegex = /\/\/ Handle Fit Bounds[^]*?const lastBoundsRef = useRef[^]*?useEffect\(\(\) => \{/;

const blockToMatch = \const lastBoundsRef = useRef('');
    const cameraTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (map && boundsToFit && boundsToFit.length > 0) {
            const dynamicPadding = { top: 96, bottom: 400, left: 56, right: 56 };\;

const startIdx = code.indexOf('    const lastBoundsRef = useRef');
const endIdx = code.indexOf('    useEffect(() => {\\n        return () => {\\n            cameraTimeoutsRef.current.forEach(t');

if (startIdx !== -1 && endIdx !== -1) {
    const newBlock = \const lastBoundsRef = useRef('');
    const cameraTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

            const applyCamera = () => {
                const bounds = new google.maps.LatLngBounds();
                
                if (boundsToFit.length === 1) {
                    const target = boundsToFit[0];
                    // Synthetic tight bound (approx 60x60 meters) forces native map.panToBounds
                    // This elegantly tricks Google Maps into animating completely natively
                    // to zoom ~18 without any manual stuttering JS frame loops.
                    const offset = 0.0003; 
                    bounds.extend({ lat: target.lat - offset, lng: target.lng - offset });
                    bounds.extend({ lat: target.lat + offset, lng: target.lng + offset });
                } else {
                    boundsToFit.forEach(coord => bounds.extend(coord));
                }

                try {
                    (map as any).panToBounds(bounds, dynamicPadding);
                } catch (e) {
                    map.fitBounds(bounds, dynamicPadding);
                }

                // Native panToBounds takes ~1-1.5s. Reset trigger right after.
                setTimeout(() => {
                    resetBoundsTrigger();
                }, 1500);
            };

            // Small 50ms delay just to allow any layout shifts to settle (much faster than 300ms)
            const t = setTimeout(applyCamera, 50);
            cameraTimeoutsRef.current.push(t);
        }
    }, [map, boundsToFit, resetBoundsTrigger]);

\;
    code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
} else {
    console.log("Could not find blocks!");
}

fs.writeFileSync('components/MapLayer.tsx', code);
