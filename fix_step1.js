const fs = require('fs');
let code = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/steps/Step1Where.tsx', 'utf8');

if (!code.includes('Bike, Box')) {
    code = code.replace(/import \{ MapPin, Map, Check, Plus, LocateFixed, X, Zap, Clock, Star, RefreshCw \} from 'lucide-react';/, "import { MapPin, Map, Check, Plus, LocateFixed, X, Zap, Clock, Star, RefreshCw, Bike, Box } from 'lucide-react';");
}

code = code.replace(/placeholder=\{data\.waypoints\.length > 0 \? 'Final Destination' : 'Dropoff Location'\}/g, "placeholder={data.waypoints.length > 0 ? 'Final Destination' : '📍 Where are you sending to?'}");

const oldSavedBlockMatch = code.match(/\{\/\* Saved Addresses horizontal scroll \*\/\}\r?\n\s*\{user\?\.savedAddresses && user\.savedAddresses\.length > 0 && \([\s\S]*?<\/div>\r?\n\s*\)\}/);
if (oldSavedBlockMatch) {
    code = code.replace(oldSavedBlockMatch[0], "");
}

const cta = \
            {/* Express/Standard Toggles (New) */}
            <div className="grid grid-cols-2 gap-2 pb-1">
                <button
                    onClick={() => updateData({ serviceType: 'Express', vehicle: 'Boda Boda' })}
                    className={\\\lex flex-col items-start p-3 rounded-2xl border transition-all \\\\}
                >
                    <div className={\\\p-1.5 rounded-xl mb-2 \\\\}>
                        <Bike size={18} />
                    </div>
                    <span className={\\\ont-bold text-xs \\\\}>Express Delivery</span>
                    <span className={\\\	ext-[9px] mt-0.5 \\\\}>Quick & Lightweight</span>
                </button>
                <button
                    onClick={() => updateData({ serviceType: 'Standard', vehicle: 'Minivan' })}
                    className={\\\lex flex-col items-start p-3 rounded-2xl border transition-all \\\\}
                >
                    <div className={\\\p-1.5 rounded-xl mb-2 \\\\}>
                        <Box size={18} />
                    </div>
                    <span className={\\\ont-bold text-xs \\\\}>Standard Parcel</span>
                    <span className={\\\	ext-[9px] mt-0.5 \\\\}>Consolidated & Heavy</span>
                </button>
            </div>

            {/* Route Builder Card */}\;
if(!code.includes('Express/Standard Toggles')) {
    code = code.replace("{/* Route Builder Card */}", cta);
}

const oldRecentDestinations = code.match(/\{\/\* Recent Destinations \(from order history\) \*\/\}\r?\n\s*\{showRecentDestinations && \([\s\S]*?<\/div>\r?\n\s*\)\}/);
if(oldRecentDestinations) {
    code = code.replace(oldRecentDestinations[0], "");
}

const horizontal_recent = \
            {/* Horizontal Recent Destinations & Saved Addresses */}
            {(((user?.savedAddresses?.length || 0) > 0) || recentDestinations.length > 0) && !data.dropoff && !dropoffSuggestions.length && !isMapSelecting && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 mb-2">
                    {user?.savedAddresses?.map((entry) => (
                        <button
                            key={entry.id}
                            onMouseDown={() => handleSavedAddressSelect(entry)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-[11px] font-bold whitespace-nowrap hover:bg-brand-100 transition-colors"
                        >
                            <Star size={12} className="fill-brand-500 text-brand-500 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{entry.label}</span>
                        </button>
                    ))}
                    {recentDestinations.map((dest, i) => (
                        <button
                            key={i}
                            onMouseDown={() => handleRecentDestinationSelect(dest)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-[11px] font-bold whitespace-nowrap hover:bg-gray-50 transition-colors"
                        >
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{dest.address.split(',')[0]}</span>
                        </button>
                    ))}
                </div>
            )}
\;
if(!code.includes('Horizontal Recent Destinations & Saved Addresses')) {
    code = code.replace("{/* Schedule & Return Toggle (shown once dropoff is confirmed) */}", horizontal_recent + "\\n            {/* Schedule & Return Toggle (shown once dropoff is confirmed) */}");
}

fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/steps/Step1Where.tsx', code, 'utf8');
