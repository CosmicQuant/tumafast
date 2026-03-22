const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

const target = 'const { pickupCoords, dropoffCoords, waypointCoords, setRoutePolyline, setIsMapSelecting, setActiveInput, setPickupCoords, setWaypointCoords, userLocation } = useMapState();';
if (code.includes(target)) {
    code = code.replace(target, 'const { pickupCoords, dropoffCoords, waypointCoords, setRoutePolyline, setIsMapSelecting, setActiveInput, setPickupCoords, setWaypointCoords, setDropoffCoords, userLocation } = useMapState();');
    fs.writeFileSync('components/booking/BookingWizard.tsx', code);
    console.log("Replaced using target 1");
} else {
    // maybe formatted differently
    code = code.replace(/userLocation \}\s*=\s*useMapState\(\);/g, "setDropoffCoords, userLocation } = useMapState();");
    fs.writeFileSync('components/booking/BookingWizard.tsx', code);
    console.log("Replaced using target 2");
}
