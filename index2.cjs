const fs = require('fs');
const content = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');
const start = content.indexOf('const Step1Where =');
const end = content.indexOf('// --- Step 2: WHAT ---');
console.log(content.slice(start, end));
