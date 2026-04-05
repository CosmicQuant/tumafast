const fs = require('fs');
let code = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', 'utf8');
code = code.replace(/\{step === 0 && <Step1Where \\/>\}/, '{step === -1 && <Step0Dashboard />}\\n{step === 0 && <Step1Where />}');
fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', code, 'utf8');
