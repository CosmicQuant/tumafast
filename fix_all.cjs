const fs = require('fs');

let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

code = code.replace(
    /const \{ pickupCoords, dropoffCoords, waypointCoords, setRoutePolyline, setIsMapSelecting, setActiveInput, setPickupCoords, setWaypointCoords, userLocation \} = useMapState\(\);/g,
    "const { pickupCoords, dropoffCoords, waypointCoords, setRoutePolyline, setIsMapSelecting, setActiveInput, setPickupCoords, setWaypointCoords, setDropoffCoords, userLocation } = useMapState();"
);

code = code.replace(/\{isMapSelecting && \([\s\S]*?<\/button>\s*<\/div>\s*\)\}/g, '');

code = code.replace(
    /<AnimatePresence mode="wait">/,
    \{isMapSelecting && (
                <div className="absolute top-0 -translate-y-[150%] left-0 right-0 z-[120] flex justify-center">
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
            <AnimatePresence mode="wait">\
);

code = code.replace(
    /className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden max-h-48 overflow-y-auto"/g,
    'className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 z-[150] overflow-hidden max-h-48 overflow-y-auto"'
);

const pickupHandleChangeStr = 'value={data.pickup} onChange={e => handlePickupChange(e.target.value)}';
code = code.replace(
    pickupHandleChangeStr,
    \alue={data.pickup}
                                onChange={e => handlePickupChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (pickupSuggestions && pickupSuggestions.length > 0) {
                                            handlePickupSelect(pickupSuggestions[0]);
                                        } else if (data.pickup && data.pickup.length > 2) {
                                            setActiveTab('dropoff');
                                        }
                                    }
                                }}\
);

const dpHandleChangeStr = 'value={data.dropoff} onChange={e => handleDropoffChange(e.target.value)}';
code = code.replace(
    dpHandleChangeStr,
    \alue={data.dropoff}
                                onChange={e => handleDropoffChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (dropoffSuggestions && dropoffSuggestions.length > 0) {
                                            handleDropoffSelect(dropoffSuggestions[0]);
                                        }
                                    }
                                }}\
);

fs.writeFileSync('components/booking/BookingWizard.tsx', code);
console.log("Done");
