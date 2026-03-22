const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');
const p = code.indexOf('const submitBooking');
console.log(code.slice(p, p + 1500));
