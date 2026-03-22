const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

// Remove the Next button in pickup
const btnRe = /<button\s*onClick=\{\(\) => setActiveTab\('dropoff'\)\}\s*className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1\.5"\s*>Next <ArrowRight size=\{16\} \/><\/button>/m;
code = code.replace(btnRe, '');

// Update Pickup input container
const oldPickupEnd = `<button onClick={() => update({ pickup: 'Current Location' })} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-green-50">
                                <LocateFixed className="text-brand-600" size={16} />
                            </button>
                        </div>`;
const newPickupEnd = `<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button onClick={() => update({ pickup: 'Current Location' })} className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-green-50" title="Current Location">
                                    <LocateFixed className="text-green-600" size={16} />
                                </button>
                                <button className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-brand-50" title="Choose on Map">
                                    <Map className="text-brand-600" size={16} />
                                </button>
                            </div>
                        </div>`;
code = code.replace(oldPickupEnd, newPickupEnd);

const oldDropoffEnd = `{data.dropoff && !maxDropoffsReached && (
                                <button onClick={() => update({ waypoints: [...data.waypoints, data.dropoff], dropoff: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100">
                                    <Plus size={16} />
                                </button>
                            )}`;

const newDropoffEnd = `<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {data.dropoff && !maxDropoffsReached && (
                                    <button onClick={() => update({ waypoints: [...data.waypoints, data.dropoff], dropoff: '' })} className="p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100" title="Add Waypoint">
                                        <Plus size={16} />
                                    </button>
                                )}
                                <button className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-brand-50" title="Choose on Map">
                                    <Map className="text-brand-600" size={16} />
                                </button>
                            </div>`;
code = code.replace(oldDropoffEnd, newDropoffEnd);

fs.writeFileSync('components/booking/BookingWizard.tsx', code, 'utf8');
console.log('Modified Step 1 map buttons');
