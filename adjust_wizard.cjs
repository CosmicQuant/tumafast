const fs = require('fs');
let wizard = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', 'utf8');
wizard = wizard.replace(/step === 0 \\? 'max-h-\\[85vh\\]'/, 'step === 0 ? \\'max-h-[50vh]\\'');
fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', wizard, 'utf8');
