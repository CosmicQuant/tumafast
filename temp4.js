const fs = require('fs');
let code = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', 'utf8');
code = code.replace(/const ActiveStepIcon = STEP_INFO\\[step\\]\\.icon;/g, 'const ActiveStepIcon = step >= 0 && step < STEP_INFO.length ? STEP_INFO[step].icon : Navigation;');
code = code.replace(/STEP_INFO\\[step\\]\\.title/g, 'STEP_INFO[step]?.title');
code = code.replace(/className=\{\h-1\\.5 rounded-full \\\$\\{i === step \\? 'w-5 bg-brand-600' : 'w-1\\.5 bg-gray-200'\\}\\} \\/>\\)}\\r?\\n\\s*<\\/div>\\r?\\n\\s*<\\/div>\\r?\\n\\s*<\\/div>\\r?\\n\\s*<\\/div>/, 'className={h-1.5 rounded-full } />)}\\n</div>\\n</div>\\n</div>\\n</div>\\n)}');
fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx', code, 'utf8');
