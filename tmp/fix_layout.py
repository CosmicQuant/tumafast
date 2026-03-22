import os

fp = 'components/BookingForm.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

# Update Dropoff Limit logic & Timeline
# 1. Add maxDropoffsReached boolean in Step1Where
new_logic = '''const activeTab = data.pickup ? 'dropoff' : 'pickup';
    const isPickupActive = activeTab === 'pickup';
    const maxDropoffsReached = data.waypoints.length >= 5;'''

text = text.replace('''const activeTab = data.pickup ? 'dropoff' : 'pickup';
    const isPickupActive = activeTab === 'pickup';''', new_logic)

# 2. Update horizontal pills to vertical route timeline
old_pills = '''                        {data.waypoints.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {data.waypoints.map((wp: string, idx: number) => (
                                    <div key={idx} className="flex-none max-w-[150px] bg-brand-50 border border-brand-100 rounded-full px-3 py-1 flex items-center gap-1.5">
                                        <MapPin size={12} className="text-brand-600 shrink-0"/>
                                        <span className="text-xs font-medium text-brand-900 truncate" title={wp}>{wp}</span>
                                        <button 
                                            onClick={() => updateData({ waypoints: data.waypoints.filter((_: any, i: number) => i !== idx) })}
                                            className="hover:bg-brand-200 p-0.5 rounded-full shrink-0"
                                        >
                                            <X size={10} className="text-brand-600"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}'''

new_timeline = '''                        {/* Vertical Route Timeline */}
                        {data.waypoints.length > 0 && (
                            <div className="py-2 px-1 mb-2">
                                <div className="relative border-l-2 border-dashed border-gray-200 ml-3 space-y-3 pl-4 py-1">
                                    {/* Pickup Node */}
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Pickup</div>
                                        <div className="text-xs font-bold text-gray-900 truncate">{data.pickup}</div>
                                    </div>
                                    
                                    {/* Dropoff Nodes */}
                                    <AnimatePresence>
                                        {data.waypoints.map((wp: string, idx: number) => (
                                            <motion.div 
                                                key={idx} 
                                                initial={{opacity: 0, height: 0, y: -10}} 
                                                animate={{opacity: 1, height: 'auto', y: 0}} 
                                                exit={{opacity: 0, height: 0}} 
                                                className="relative group pr-6"
                                            >
                                                <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-500 rounded-full border-2 border-white shadow-sm" />
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Dropoff {idx + 1}</div>
                                                <div className="text-xs font-bold text-gray-900 truncate pr-2">{wp}</div>
                                                <button 
                                                    onClick={() => updateData({ waypoints: data.waypoints.filter((_: any, i: number) => i !== idx) })}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 p-1.5 rounded-full"
                                                >
                                                    <X size={12} className="text-red-500"/>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}'''

text = text.replace(old_pills, new_timeline)

# 3. Update Input Placeholder and max constraints
old_input = '''                                <input
                                    type="text"
                                    value={dropoffInput}
                                    onChange={(e) => setDropoffInput(e.target.value)}
                                    placeholder="Add another waypoint..."
                                    className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0 placeholder-gray-400"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddWaypoint()}
                                />'''

new_input = '''                                <input
                                    type="text"
                                    value={dropoffInput}
                                    onChange={(e) => setDropoffInput(e.target.value)}
                                    placeholder={maxDropoffsReached ? "Max dropoffs reached (5)" : "Add another dropoff..."}
                                    disabled={maxDropoffsReached}
                                    className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0 placeholder-gray-400 disabled:opacity-50"
                                    onKeyPress={(e) => e.key === 'Enter' && !maxDropoffsReached && handleAddWaypoint()}
                                />'''

text = text.replace(old_input, new_input)
text = text.replace('''<div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                                        <div className="h-6 w-px bg-gray-200" />
                                    </div>''', '''<div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${maxDropoffsReached ? 'bg-gray-400' : 'bg-brand-500'}`} />
                                        <div className="h-6 w-px bg-gray-200" />
                                    </div>''')

# Add button disabling
text = text.replace('''                                    <button 
                                        onClick={handleAddWaypoint}
                                        className="h-full px-4 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors uppercase tracking-wide"
                                    >''', '''                                    {!maxDropoffsReached && (
                                        <button 
                                            onClick={handleAddWaypoint}
                                            className="h-full px-4 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors uppercase tracking-wide"
                                        >''')
text = text.replace('''Add
                                    </button>''', '''Add
                                        </button>
                                    )}''')

# 4. Fix Step 2 Cargo Type Dropdown clipping
text = text.replace('''<div className="grid grid-cols-2 gap-3">''', '''<div className="grid grid-cols-2 gap-3 pt-1">''')



with open(fp, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done layout fixes')