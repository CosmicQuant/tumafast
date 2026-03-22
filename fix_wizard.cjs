const fs = require('fs');

let c = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

c = c.replace(
    /const \{ setPickupCoords, setWaypointCoords, waypointCoords, setIsMapSelecting, setActiveInput \} = useMapState\(\);/g, 
    "const { setPickupCoords, setWaypointCoords, waypointCoords, setIsMapSelecting, setActiveInput, isMapSelecting, activeInput, mapCenter } = useMapState();"
);

c = c.replace(
    /return \(\s*<div className="space-y-3 relative">/g,
    'return (\n' +
    '        <div className="space-y-3 relative">\n' +
    '            {isMapSelecting && (\n' +
    '                <div className="absolute -top-[150%] left-0 right-0 z-[101] flex justify-center">\n' +
    '                    <button\n' +
    '                        onClick={async () => {\n' +
    '                            setIsMapSelecting(false);\n' +
    '                            if (mapCenter) {\n' +
    '                                const lat = mapCenter.lat;\n' +
    '                                const lng = mapCenter.lng;\n' +
    '                                const address = await mapService.reverseGeocode(lat, lng) || \'Selected Location\';\n' +
    '                                \n' +
    '                                if (activeInput === \'pickup\') {\n' +
    '                                    update({ pickup: address });\n' +
    '                                    setPickupCoords({ lat, lng });\n' +
    '                                    setActiveTab(\'dropoff\');\n' +
    '                                } else {\n' +
    '                                    const newWp = [...data.waypoints, address];\n' +
    '                                    const newCoords = [...waypointCoords, { lat, lng }];\n' +
    '                                    update({ waypoints: newWp, dropoff: \'\' });\n' +
    '                                    setWaypointCoords(newCoords);\n' +
    '                                }\n' +
    '                            }\n' +
    '                        }}\n' +
    '                        className="px-6 py-3 bg-brand-600 text-white rounded-full font-bold shadow-xl border-4 border-white flex items-center gap-2 hover:scale-105 transition-transform"\n' +
    '                    >\n' +
    '                        <Check size={18} /> Confirm {activeInput === \'pickup\' ? \'Pickup\' : \'Dropoff\'} Here\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '            )}'
);

fs.writeFileSync('components/booking/BookingWizard.tsx', c);
console.log("Updated map select");
