const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

// remove all instances of isMapSelecting block
code = code.replace(/\{isMapSelecting && \([\s\S]*?<\/button>[\s\n]*<\/div>[\s\n]*\)\}/g, '');

code = code.replace(
    '<AnimatePresence mode="wait">',
    '{isMapSelecting && (\n' +
    '    <div className="absolute top-[0%] -translate-y-[130%] left-0 right-0 z-[120] flex justify-center">\n' +
    '        <button\n' +
    '            onClick={async () => {\n' +
    '                setIsMapSelecting(false);\n' +
    '                if (mapCenter) {\n' +
    '                    const lat = mapCenter.lat;\n' +
    '                    const lng = mapCenter.lng;\n' +
    '                    const address = await mapService.reverseGeocode(lat, lng) || "Selected Location";\n' +
    '                    \n' +
    '                    if (activeInput === "pickup") {\n' +
    '                        update({ pickup: address });\n' +
    '                        setPickupCoords({ lat, lng });\n' +
    '                        setActiveTab("dropoff");\n' +
    '                    } else {\n' +
    '                        const newWp = [...data.waypoints, address];\n' +
    '                        const newCoords = [...waypointCoords, { lat, lng }];\n' +
    '                        update({ waypoints: newWp, dropoff: "" });\n' +
    '                        setWaypointCoords(newCoords);\n' +
    '                    }\n' +
    '                }\n' +
    '            }}\n' +
    '            className="px-6 py-3 bg-brand-600 text-white rounded-full font-bold shadow-xl border-4 border-white flex items-center gap-2 hover:scale-105 transition-transform"\n' +
    '        >\n' +
    '            <Check size={18} /> Confirm {activeInput === "pickup" ? "Pickup" : "Dropoff"} Here\n' +
    '        </button>\n' +
    '    </div>\n' +
    ')}\n' +
    '<AnimatePresence mode="wait">'
);

fs.writeFileSync('components/booking/BookingWizard.tsx', code);
console.log("Done map dups");
