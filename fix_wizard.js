const fs = require('fs');
const file = 'c:/Users/ADMIN/Desktop/axon/components/booking/BookingWizardModular.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
    'return (\n        <BookingProvider>\n            <WizardContent {...props} />\n        </BookingProvider>\n    );',
    'return (\n        <BookingProvider initialStep={props.startAtDashboard ? -1 : 0}>\n            <WizardContent {...props} />\n        </BookingProvider>\n    );'
);

txt = txt.replace(
    '{step === 0 && <Step1Where />}\n                            {step === 1 && <Step2What />}\n                            {step === 2 && <Step3How />}\n                            {step === 3 && <Step4Who />}\n                            {step === 4 && <Step5Payment submit={submitBooking} />}',
    '{step === -1 && <Step0Dashboard />}\n                            {step === 0 && <Step1Where />}\n                            {step === 1 && <Step2What />}\n                            {step === 2 && <Step3How />}\n                            {step === 3 && <Step4Who />}\n                            {step === 4 && <Step5Payment submit={submitBooking} />}'
);

txt = txt.replace(
    'const ActiveStepIcon = STEP_INFO[step].icon;',
    'const ActiveStepIcon = step >= 0 && step < STEP_INFO.length ? STEP_INFO[step].icon : Navigation;'
);

txt = txt.replace(
    'className={w-full bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.12)] rounded-t-[2.5rem] overflow-hidden pointer-events-auto border-t border-gray-100 flex flex-col pb-[env(safe-area-inset-bottom,0)] pb-1 transition-all duration-300 ,
    'className={w-full bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.12)] rounded-t-[2.5rem] overflow-hidden pointer-events-auto border-t border-gray-100 flex flex-col pb-[env(safe-area-inset-bottom,0)] pb-1 transition-all duration-300 ,
);

txt = txt.replace(
    '<div className=\"px-5 pt-3 pb-2 flex flex-col items-center w-full z-10 bg-white flex-shrink-0\">\n                    <div className=\"w-12 h-1 bg-gray-200 rounded-full mb-3\" />  \n                    <div className=\"w-full flex justify-between mt-1 items-end\">',
    '{step >= 0 && <div className=\"px-5 pt-3 pb-2 flex flex-col items-center w-full z-10 bg-white flex-shrink-0\">\n                    <div className=\"w-12 h-1 bg-gray-200 rounded-full mb-3\" />  \n                    <div className=\"w-full flex justify-between mt-1 items-end\">'
);

txt = txt.replace(
    '<div className=\"flex space-x-1.5 opacity-80\">       \n                                {[0, 1, 2, 3, 4, 5].map(i => <motion.div layout \nkey={i} className={h-1.5 rounded-full } />)}\n                            </div>\n                        </div>\n                    </div>\n                </div>',
    '<div className=\"flex space-x-1.5 opacity-80\">       \n                                {[0, 1, 2, 3, 4].map(i => <motion.div layout \nkey={i} className={h-1.5 rounded-full } />)}\n                            </div>\n                        </div>\n                    </div>\n                </div>}'
);

txt = txt.replace(
    '{step === 0 ? (data.activeTab === "pickup" ? "Pickup Point" : \n(data.waypoints.length > 0 ? "Drop offs" : "Drop off")) :\nSTEP_INFO[step].title} ({step + 1}/6)',
    '{step === 0 ? (data.activeTab === "pickup" ? "Pickup Point" : \n(data.waypoints.length > 0 ? "Drop offs" : "Drop off")) :\nSTEP_INFO[step]?.title} ({step + 1}/5)'
);


fs.writeFileSync(file, txt, 'utf8');
