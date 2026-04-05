const fs = require('fs');
let code = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', 'utf8');
code = code.replace(/const ActiveStepIcon = STEP_INFO\\[step\\]\\.icon;/, 'if (step < 0) return null; const ActiveStepIcon = STEP_INFO[step]?.icon || Navigation;');
fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', code, 'utf8');
