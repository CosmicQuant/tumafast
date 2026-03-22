const fs = require('fs');
let code = fs.readFileSync('components/BookingPage.tsx', 'utf8');

code = code.replace(/import BookingForm from '\.\/BookingForm';/, "import BookingWizard from './booking/BookingWizard';");

code = code.replace(/<BookingForm/g, '<BookingWizard');

fs.writeFileSync('components/BookingPage.tsx', code, 'utf8');
console.log('done');
