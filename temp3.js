const fs = require('fs');
let code = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', 'utf8');
code = code.replace(/<BookingProvider>/g, '<BookingProvider initialStep={props.startAtDashboard ? -1 : 0}>');
fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', code, 'utf8');
