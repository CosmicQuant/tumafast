const fs = require('fs');
const code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');
const calculateStart = code.indexOf('const calculateRoute = async () => {');
const calculateEnd = code.indexOf('const timer = setTimeout(calculateRoute, 800);');
console.log(code.slice(calculateStart, calculateEnd));
