
const fs = require('fs');
let code = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', 'utf8');

code = code.replace(/import \{ Step2_5PackageDetails \} from \'\.\/steps\/Step2_5PackageDetails\';\r?\n/, '');
code = code.replace(/\{step === 2 && <Step2_5PackageDetails \/>\}\r?\n\s+/, '');
code = code.replace(/\{step === 3 && <Step3How \/>\}/, '{step === 2 && <Step3How />}');
code = code.replace(/\{step === 4 && <Step4Who \/>\}/, '{step === 3 && <Step4Who />}');
code = code.replace(/\{step === 5 && <Step5Payment submit=\{submitBooking\} \/>\}/, '{step === 4 && <Step5Payment submit={submitBooking} />}');
code = code.replace(/\{ title: \'Package Details\', icon: Box \},.*?\r?\n\s+/, '');

fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', code, 'utf8');

