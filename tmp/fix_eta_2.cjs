const fs = require('fs');

let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

// 1. Remove the old floating ETA
const oldStart = code.indexOf('{/* Floating Distance & ETA badge */}');
const oldEnd = code.indexOf('{/* Sheet Background adhering exactly to the bottom */}');

if (oldStart !== -1 && oldEnd !== -1) {
    code = code.slice(0, oldStart) + code.slice(oldEnd);
    console.log('Removed old floating ETA');
}

// 2. Insert the new one
const t2 = '<div className="flex space-x-1.5 opacity-80">';
const idx = code.indexOf(t2);

if (idx !== -1) {
    const insert = `<div className="flex flex-col items-end gap-1.5 mt-[-4px]">
                              <AnimatePresence>
                                  {data.distanceKm > 0 && (
                                      <motion.div 
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 5 }}
                                          className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-brand-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] mb-1"
                                      >
                                          <div className="flex flex-col text-center">
                                              <span className="text-[7px] text-brand-600 font-bold uppercase tracking-widest leading-none mb-[1px]">Dist</span>
                                              <span className="text-[11px] font-black text-gray-900 leading-none">{data.distanceKm} <span className="text-[8px] text-gray-500 font-medium tracking-tighter">km</span></span>
                                          </div>
                                          <div className="w-[1px] h-4 bg-brand-100/80 mx-1" />
                                          <div className="flex flex-col text-center">
                                              <span className="text-[7px] text-brand-600 font-bold uppercase tracking-widest leading-none mb-[1px]">Time</span>
                                              <span className="text-[11px] font-black text-brand-600 leading-none">~{Math.ceil(data.distanceKm * 2.5 + 5)} <span className="text-[8px] text-brand-600/70 font-medium tracking-tighter">min</span></span>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                              ` + t2;

    code = code.replace(t2, insert);

    // Convert items-center to items-end on the header container
    code = code.replace('<div className="w-full flex items-center justify-between mt-1">', '<div className="w-full flex justify-between mt-1 items-end">');

    // We wrapped t2 (the dots container) in a flex-col, but we need to close that flex-col div right below the dots.
    const closingPoint = `                              ))}
                          </div>
                      </div>`;
    const newClosingPoint = `                              ))}
                          </div>
                          </div>
                      </div>`;
    code = code.replace(closingPoint, newClosingPoint);

    fs.writeFileSync('components/booking/BookingWizard.tsx', code, 'utf8');
    console.log("ETA inserted into modal header successfully");
} else {
    console.log("Could not find the t2 string.");
}