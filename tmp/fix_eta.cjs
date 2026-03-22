const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

const oldFloat = code.substring(code.indexOf('{/* Floating Distance & ETA badge */}'), code.indexOf('{/* Sheet Background adhering exactly to the bottom */}'));
if (oldFloat.includes('motion.div')) {
    code = code.replace(oldFloat, '');
}

const findDots = `                      <div className="w-full flex items-center justify-between mt-1">
                          {(() => {
                              const STEP_INFO = [
                                  { title: 'Route', icon: Navigation },
                                  { title: 'Cargo Type', icon: Box },
                                  { title: 'Choose Vehicle', icon: Truck },
                                  { title: 'Receiver Details', icon: User },
                                  { title: 'Payment Option', icon: Banknote }
                              ];
                              const ActiveStepIcon = STEP_INFO[step].icon;
                              return (
                                  <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50/50 px-2 py-1 rounded-md mb-2 mt-[-4px]">
                                      <ActiveStepIcon size={12} strokeWidth={3} /> {STEP_INFO[step].title} ({step + 1}/5)
                                  </span>
                              );
                          })()}
                          <div className="flex space-x-1.5 opacity-80">`;

const replaceDots = `                      <div className="w-full flex justify-between mt-1 items-end">
                          {(() => {
                              const STEP_INFO = [
                                  { title: 'Route', icon: Navigation },
                                  { title: 'Cargo Type', icon: Box },
                                  { title: 'Choose Vehicle', icon: Truck },
                                  { title: 'Receiver Details', icon: User },
                                  { title: 'Payment Option', icon: Banknote }
                              ];
                              const ActiveStepIcon = STEP_INFO[step].icon;
                              return (
                                  <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50/50 px-2 py-1 rounded-lg mb-0 mt-[-4px]">
                                      <ActiveStepIcon size={12} strokeWidth={3} /> {STEP_INFO[step].title} ({step + 1}/5)
                                  </span>
                              );
                          })()}
                          <div className="flex flex-col items-end gap-1.5">
                              <AnimatePresence>
                                  {data.distanceKm > 0 && (
                                      <motion.div 
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 5 }}
                                          className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-brand-100 shadow-sm mb-1.5"
                                      >
                                          <div className="flex flex-col text-center">
                                              <span className="text-[7px] text-brand-600 font-bold uppercase tracking-widest leading-none">Dist</span>
                                              <span className="text-[11px] font-black text-gray-900 leading-none mt-0.5">{data.distanceKm} <span className="text-[8px] text-gray-500 font-medium">km</span></span>
                                          </div>
                                          <div className="w-[1px] h-4 bg-brand-100" />
                                          <div className="flex flex-col text-center">
                                              <span className="text-[7px] text-brand-600 font-bold uppercase tracking-widest leading-none">Est</span>
                                              <span className="text-[11px] font-black text-brand-600 leading-none mt-0.5">~{Math.ceil(data.distanceKm * 2.5 + 5)} <span className="text-[8px] text-brand-600/70 font-medium">min</span></span>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                              <div className="flex space-x-1.5 opacity-80">`;

if (code.includes(findDots)) {
    code = code.replace(findDots, replaceDots);
    
    // We added an extra flex-col div, so we need to close it.
    // The previous code had:
    //                           <div className="flex space-x-1.5 opacity-80">
    //                               {[0, 1, 2, 3, 4].map(...)}
    //                           </div>
    //                       </div>
    //                   </div>
    
    const closingDots = `                          </div>
                      </div>
                      <div className="relative w-full">`;
                      
    const replacementClosing = `                          </div>
                          </div>
                      </div>
                      <div className="relative w-full">`;
                      
    // Actually an easier way to close the div:
    // find index of "</div>\n                      </div>" after replacing, 
    // Wait, let's just make the script do it via indexOf
}

fs.writeFileSync('components/booking/BookingWizard.tsx', code, 'utf8');
console.log("Process complete");