const fs = require('fs');
const content = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');
const start = content.indexOf('const Step1Where =');
console.log(content.slice(start, start + 4000));
