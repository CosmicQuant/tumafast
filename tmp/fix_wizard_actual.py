import os

fp = 'components/booking/BookingWizard.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Provide New Step1Where
new_step1 = '''const Step1Where = ({ data, update, next }: any) => {
    const [activeTab, setActiveTab] = useState<'pickup'|'dropoff'>('pickup');   
    const maxDropoffsReached = data.waypoints.length >= 5;

    // Auto-advance tab
    useEffect(() => {
        if (activeTab === 'pickup' && data.pickup !== 'Current Location' && data.pickup.length > 5 && !data.pickup.includes('Current')) {                                    
            const timer = setTimeout(() => setActiveTab('dropoff'), 1500);     
            return () => clearTimeout(timer);
        }
    }, [data.pickup, activeTab]);

    return (
        <div className="space-y-3">
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('pickup')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'pickup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}                       >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'pickup' ? 'bg-green-500' : 'bg-gray-300'}`} /> Pickup                                            
                </button>
                <button
                    onClick={() => setActiveTab('dropoff')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'dropoff' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}                      >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'dropoff' ? 'bg-brand-500' : 'bg-gray-300'}`} /> Dropoff                                          
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'pickup' ? (
                    <motion.div key="pickup" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.98}} transition={{duration: 0.15}} className="space-y-3">                                                                       
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" size={18} />                                                                      
                            <input
                                autoFocus type="text" placeholder="Set Pickup Location"                                                                                                         className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-900 text-sm font-bold transition-all"                                                                value={data.pickup} onChange={e => update({ pickup: e.target.value })}                                                                                      />
                            <button onClick={() => update({ pickup: 'Current Location' })} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-green-50">                                                    
                                <LocateFixed className="text-brand-600" size={16} />                                                                                                        
                            </button>
                        </div>
                        <button
                            onClick={() => setActiveTab('dropoff')}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"                                        
                        >Next <ArrowRight size={16} /></button>
                    </motion.div>
                ) : (
                    <motion.div key="dropoff" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.98}} transition={{duration: 0.15}} className="space-y-3">                                                                      
                        
                        {/* Route Timeline (Hidden if no waypoints yet to save space before start) */}
                        {data.waypoints.length > 0 && (
                            <div className="py-2 px-1 mb-2">
                                <div className="relative border-l-2 border-dashed border-gray-200 ml-3 space-y-3 pl-4 py-1">
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Pickup</div>
                                        <div className="text-xs font-bold text-gray-900 truncate">{data.pickup || 'Current Location'}</div>
                                    </div>
                                    <AnimatePresence>
                                        {data.waypoints.map((wp: string, idx: number) => (
                                            <motion.div key={idx} initial={{opacity: 0, height: 0, y: -10}} animate={{opacity: 1, height: 'auto', y: 0}} exit={{opacity: 0, height: 0}} className="relative group pr-6">
                                                <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-500 rounded-full border-2 border-white shadow-sm" />
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Dropoff {idx + 1}</div>
                                                <div className="text-xs font-bold text-gray-900 truncate">{wp}</div>
                                                <button onClick={() => update({ waypoints: data.waypoints.filter((_: any, i: number) => i !== idx) })} className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-50 hover:bg-red-100 p-1.5 rounded-full">
                                                    <X size={12} className="text-red-500"/>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="relative">
                            <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${maxDropoffsReached ? 'text-gray-400' : 'text-brand-600'}`} size={18} />                                                                      
                            <input
                                autoFocus type="text" placeholder={maxDropoffsReached ? "Max dropoffs reached (5)" : (data.waypoints.length > 0 ? "Add another dropoff" : "Set Dropoff Location")}
                                className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:bg-white text-gray-900 text-sm font-bold transition-all disabled:opacity-50"
                                value={data.dropoff} onChange={e => update({ dropoff: e.target.value })}
                                disabled={maxDropoffsReached}
                                onKeyDown={e => {
                                    if(e.key === 'Enter' && data.dropoff && !maxDropoffsReached) {     
                                        update({ waypoints: [...data.waypoints, data.dropoff], dropoff: '' });
                                    }
                                }}
                            />
                            {data.dropoff && !maxDropoffsReached && (
                                <button onClick={() => update({ waypoints: [...data.waypoints, data.dropoff], dropoff: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100">                                                                                                                 
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                             <button onClick={() => setActiveTab('pickup')} className="w-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200"><ArrowLeft size={16} /></button>                                                        
                             <button
                                onClick={() => { 
                                    if (data.dropoff && !maxDropoffsReached) {
                                      update({ waypoints: [...data.waypoints, data.dropoff], dropoff: '', distanceKm: 15 });
                                    } else {
                                      update({ distanceKm: 15 }); 
                                    }
                                    next(); 
                                }}                                                                                                         
                                disabled={(!data.dropoff && data.waypoints.length === 0)}                                                                                                         
                                className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"                                                                                                    >Confirm Route <Check size={16}/></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}'''


import re
# Find existing Step1Where block
idx1 = text.find('const Step1Where')
idx2 = text.find('// --- Step 2: WHAT ---')
if idx1 != -1 and idx2 != -1:
    text = text[:idx1] + new_step1 + '\n\n' + text[idx2:]
    print("Replaced Step1Where successfully")
else:
    print('Failed to find Step1 block')


# 2. Fix Step 3 Vehicle H2
old_vehicle_header = """              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5"><Truck className="text-brand-600" size={18}/> Choose Vehicle</h2>
                   <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-md">{data.distanceKm}km</span>
              </div>"""

new_vehicle_header = """              <div className="flex items-center justify-end -mt-0 mb-3">
                   <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded-md">{data.distanceKm}km Total Route</span>
              </div>"""

if old_vehicle_header in text:
    text = text.replace(old_vehicle_header, new_vehicle_header)
    print("Fixed Step3 Vehicle H2")
else:
    # Try regex fallback for spaces
    m = re.search(r'<div className="flex items-center justify-between">.*?Choose Vehicle</h2>.*?</span>\s*</div>', text, re.DOTALL)
    if m:
        text = text[:m.start()] + new_vehicle_header + text[m.end():]
        print("Fixed Step3 Vehicle H2 via regex")
    else:
        print("Failed to fix Step3 Vehicle H2")

# 3. Double check padding is correct for Step2What
old_padding = 'flex gap-2 overflow-x-auto pb-1 px-0.5'
new_padding = 'flex gap-2 overflow-x-auto py-1 px-1'
if old_padding in text:
    text = text.replace(old_padding, new_padding)
    print("Updated step2 padding")

with open(fp, 'w', encoding='utf-8') as f:
    f.write(text)

print("Modifications written successfully!")