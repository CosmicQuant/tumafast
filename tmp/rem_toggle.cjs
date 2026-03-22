const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

const tStart = code.indexOf('<div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">');
const tEnd = code.indexOf('</button>\n            </div>', tStart);

if (tStart !== -1 && tEnd !== -1) {
    code = code.slice(0, tStart) + code.slice(tEnd + '</button>\n            </div>'.length);
    fs.writeFileSync('components/booking/BookingWizard.tsx', code, 'utf8');
    console.log('Removed Toggle');
} else {
    console.log('Not found');
}