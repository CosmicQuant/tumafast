import os

fp = 'components/booking/BookingWizard.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

new_step1 = '''const Step1Where = ({ data, update, next }: any) => {
    const [activeTab, setActiveTab] = useState<'pickup'|'dropoff'>('pickup');   
    const maxDropoffsReached = data.waypoints.length >= 5;

    useEffect(() => {
        if (activeTab === 'pickup' && data.pickup && data.pickup !== 'Current Location' && data.pickup.length > 5 && !data.pickup.includes('Current')) {                                    
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
                                autoFocus type="text" placeholder="Set Pickup Location"
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-900 text-sm font-bold transition-all"
                                value={data.pickup} onChange={e => update({ pickup: e.target.value })}
                            />
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
                        
                        {/* Horizontal Route Timeline */}
                        {data.waypoints.length > 0 && (
                            <div className="py-2 mb-2 w-full">
                                <div className="flex items-center overflow-x-auto no-scrollbar pb-3 pt-1 px-1 snap-x">
                                    {/* Pickup Node */}
                                    <div className="flex flex-col items-center flex-shrink-0 snap-start w-[80px]">
                                        <div className="w-4 h-4 bg-green-500 rounded-full border-[3px] border-white shadow-sm z-10" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Pickup</span>
                                        <span className="text-xs font-bold text-gray-900 truncate w-full text-center px-1" title={data.pickup || 'Current Location'}>{data.pickup || 'Current Location'}</span>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {data.waypoints.map((wp: string, idx: number) => (
                                            <motion.div 
                                                key={idx} 
                                                initial={{opacity: 0, width: 0, scale: 0.8}} 
                                                animate={{opacity: 1, width: 'auto', scale: 1}} 
                                                exit={{opacity: 0, width: 0, scale: 0.8}} 
                                                transition={{type: "spring", bounce: 0.3}}
                                                className="flex items-center flex-shrink-0 snap-start"
                                            >
                                                {/* Connecting Line */}
                                                <div className="w-8 md:w-16 h-[2px] bg-gray-200 -mt-[30px]" />
                                                
                                                {/* Node */}
                                                <div className="flex flex-col items-center relative group w-[80px]">
                                                    <div className="w-4 h-4 bg-brand-500 rounded-full border-[3px] border-white shadow-sm z-10" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Dropoff {idx + 1}</span>
                                                    <span className="text-xs font-bold text-gray-900 truncate w-full text-center px-1" title={wp}>{wp}</span>
                                                    
                                                    {/* Remove button */}
                                                    <button onClick={() => update({ waypoints: data.waypoints.filter((_: any, i: number) => i !== idx) })} className="absolute -top-3 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 p-1 rounded-full z-20 shadow-sm border border-red-100">
                                                        <X size={10} className="text-red-500"/>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

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
                                className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >Confirm Route <Check size={16}/></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}'''

new_step2 = '''const Step2What = ({ data, update, next, prev }: any) => {
    const tabs = [
        { id: 'A', label: '📦 Standard' },
        { id: 'B', label: '🛋️ Bulky' },
        { id: 'C', label: '🚛 Dedicated' }
    ];

    const subcategories = {
        'A': [
            { id: 'Document', label: 'Document', desc: 'Max 0.5kg' },
            { id: 'Small Box', label: 'Small Box', desc: 'Max 2kg' },
            { id: 'Medium Box', label: 'Medium Box', desc: 'Max 5kg' },
            { id: 'Large Box', label: 'Large Box', desc: 'Max 15kg' },
            { id: 'Jumbo Box', label: 'Jumbo Box', desc: 'Max 30kg' },
            { id: 'Custom Dimensions', label: 'Custom Dimensions', desc: 'Enter sizes below' }
        ],
        'B': [
            { id: 'TVs', label: 'TVs (All Sizes)', desc: 'Secure transit' },
            { id: 'Fridges & Freezers', label: 'Fridges & Freezers', desc: 'Upright handling' },
            { id: 'Washing Machines', label: 'Washing Machines', desc: 'Heavy appliances' },
            { id: 'Sofas & Seats', label: 'Sofas & Seats', desc: 'Furniture delivery' },
            { id: 'Beds & Mattresses', label: 'Beds & Mattresses', desc: 'Bedroom furniture' },
            { id: 'Hardware', label: 'Hardware/Construction', desc: 'Raw materials' },
            { id: 'Agricultural Sacks', label: '90kg Ag Sacks', desc: 'Cereals & Produce' }
        ],
        'C': [
            { id: 'Cargo Tuk-Tuk', label: 'Cargo Tuk-Tuk', desc: 'Max 500kg' },
            { id: 'Station Wagon', label: 'Station Wagon', desc: 'Max 500kg' },
            { id: '1-Ton Pick-up', label: '1-Ton Pick-up', desc: 'Farm & Hardware' },
            { id: '3-Ton Canter', label: '3-Ton Canter', desc: 'Mid-size loads' },
            { id: '10-Ton Lorry', label: '10-Ton Lorry', desc: 'Heavy freight' }
        ]
    };

    const activeItems = subcategories[data.category as keyof typeof subcategories];

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => update({ category: tab.id, subCategory: '' })}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                            data.category === tab.id 
                                ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm ring-1 ring-brand-500' 
                                : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Vertical Subcategory Grid */}
            <div className="min-h-[160px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={data.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto no-scrollbar p-1 pb-4"
                    >
                        {activeItems.map((item) => {
                            const isSelected = data.subCategory === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => update({ subCategory: item.id })}
                                    className={`text-left p-3 rounded-xl border transition-all ${
                                        isSelected 
                                            ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 shadow-sm scale-[1.02]' 
                                            : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`text-sm font-bold ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>{item.label}</div>
                                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-brand-600' : 'text-gray-500'}`}>{item.desc}</div>
                                </button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Conditional Inputs - Only for Standard (Category A) */}
            <AnimatePresence>
                {data.category === 'A' && data.subCategory !== '' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 gap-3 pt-2 px-1">
                            {['Length', 'Width', 'Height', 'Weight'].map((dim) => {
                                const prop = dim.toLowerCase() as keyof typeof data.dimensions;
                                return (
                                    <div key={dim} className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">{dim} {dim === 'Weight' ? '(kg)' : '(cm)'}</label>
                                        <input
                                            type="number"
                                            value={data.dimensions[prop]}
                                            onChange={e => update({ dimensions: { ...data.dimensions, [prop]: e.target.value }})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2 pt-2">
                <button onClick={prev} className="w-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200"><ArrowLeft size={16} /></button>
                <button
                    onClick={next}
                    disabled={!data.subCategory}
                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                >
                    Next: Visual Verification <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}'''


idx1 = text.find('const Step1Where')
idx2 = text.find('const Step3How')

if idx1 != -1 and idx2 != -1:
    text = text[:idx1] + new_step1 + '\n\n' + new_step2 + '\n\n' + text[idx2:]
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced step1 and step2 successfully")
else:
    print("Could not find delimiters")

