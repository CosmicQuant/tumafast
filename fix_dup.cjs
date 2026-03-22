const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');
code = code.replace("setDropoffCoords, setDropoffCoords", "setDropoffCoords");
fs.writeFileSync('components/booking/BookingWizard.tsx', code);
