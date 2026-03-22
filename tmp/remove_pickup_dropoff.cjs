const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

const tStart = code.indexOf('<div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">');
if (tStart !== -1) {
    const endReg = /<\/button>\s*<\/div>/m;
    const match = code.substring(tStart).match(endReg);
    if (match) {
        code = code.slice(0, tStart) + code.slice(tStart + match.index + match[0].length);
        fs.writeFileSync('components/booking/BookingWizard.tsx', code, 'utf8');
        console.log('Done!');
    } else {
        console.log('End tag not found');
    }
} else {
    console.log('Start tag not found');
}