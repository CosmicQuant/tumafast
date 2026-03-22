const fs = require('fs');
let c = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

c = c.replace(
    /const \{ setPickupCoords, setWaypointCoords, waypointCoords, setIsMapSelecting, setActiveInput \} = useMapState\(\);/g, 
    "const { setPickupCoords, setWaypointCoords, waypointCoords, setIsMapSelecting, setActiveInput, isMapSelecting, activeInput, mapCenter } = useMapState();"
);

c = c.replace(
    /return \(\s*<div className="space-y-3 relative">/g,
    \eturn (
        <div className="space-y-3 relative">
            {isMapSelecting && (
                <div className="absolute -top-[150%] left-0 right-0 z-[101] flex justify-center">
                    <button
                        onClick={async () => {
                            setIsMapSelecting(false);
                            if (mapCenter) {
                                const lat = mapCenter.lat;
                                const lng = mapCenter.lng;
                                const address = await mapService.reverseGeocode(lat, lng) || 'Selected Location';
                                
                                if (activeInput === 'pickup') {
                                    update({ pickup: address });
                                    setPickupCoords({ lat, lng });
                                    setActiveTab('dropoff');
                                } else {
                                    const newWp = [...data.waypoints, address];
                                    const newCoords = [...waypointCoords, { lat, lng }];
                                    update({ waypoints: newWp, dropoff: '' });
                                    setWaypointCoords(newCoords);
                                }
                            }
                        }}
                        className="px-6 py-3 bg-brand-600 text-white rounded-full font-bold shadow-xl border-4 border-white flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Check size={18} /> Confirm {activeInput === 'pickup' ? 'Pickup' : 'Dropoff'} Here
                    </button>
                </div>
            )}
\
);

fs.writeFileSync('components/booking/BookingWizard.tsx', c);
console.log("Updated map select");
