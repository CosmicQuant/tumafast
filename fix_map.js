const fs = require('fs');
let c = fs.readFileSync('components/MapLayer.tsx', 'utf8');

c = c.replace(/\{userLocation && \([\s\S]*?<\/OverlayView>\s*\)\}/, 
\{userLocation && !pickupCoords && (
    <OverlayView
        position={userLocation}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
        <div className="flex flex-col items-center -translate-x-1/2 -translate-y-[90%] cursor-pointer hover:scale-110 transition-transform">
                            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg mb-0.5 whitespace-nowrap">
                                Pickup
                            </div>
                            <MapPin className="w-8 h-8 text-emerald-500 drop-shadow-md" style={{ fill: "currentColor" }} />
                        </div>
    </OverlayView>
)}\);

c = c.replace(/\{pickupCoords && \(\!isMapSelecting \|\| activeInput !== 'pickup'\) && \(\s*<>\s*<OverlayView[\s\S]*?<\/OverlayView>/, 
\{pickupCoords && (!isMapSelecting || activeInput !== 'pickup') && (
    <>
        <OverlayView
            position={pickupCoords}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
            <div
                onClick={() => {
                    if (orderState === 'DRAFTING' || allowMarkerClick) {
                        setActiveInput('pickup');
                        setIsMapSelecting(true);
                    }
                }}
                className="flex flex-col items-center -translate-x-1/2 -translate-y-[90%] cursor-pointer hover:scale-110 transition-transform"
            >
                <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg mb-0.5 whitespace-nowrap">
                    Pickup
                </div>
                <MapPin className="w-8 h-8 text-emerald-500 drop-shadow-md" style={{ fill: "currentColor" }} />
            </div>
        </OverlayView>\);

fs.writeFileSync('components/MapLayer.tsx', c);
console.log("Done fixed map markers");
