import re

with open('components/BookingForm.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace header
header_target = '<div className="w-12 h-1.5 bg-gray-300/50 rounded-full group-hover:bg-gray-400/50 transition-colors mb-2" />'
header_new = """<div className="w-12 h-1.5 bg-gray-300/50 rounded-full group-hover:bg-gray-400/50 transition-colors mb-2" />
                            {!isCollapsed && (
                                <div className="w-full px-6 flex items-center justify-between pb-4 mt-2 border-b border-gray-100 mb-6">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); if (step > 1) setStep(step - 1); }}
                                        className={"p-2 rounded-full hover:bg-gray-100 transition-colors " + (step === 1 ? "opacity-0 pointer-events-none" : "opacity-100")}
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                                    </button>
                                    <div className="flex space-x-2">
                                        {[1,2,3,4].map(s => (
                                            <div key={s} className={"h-2 transition-all duration-500 rounded-full " + (step === s ? "w-6 bg-brand-600" : (step > s ? "w-2 bg-brand-400" : "w-2 bg-gray-200"))} />
                                        ))}
                                    </div>
                                    <div className="w-10"></div>
                                </div>
                            )}"""

text = text.replace(header_target, header_new)

# Insert at top of fields (Step 1)
s1_start = '{/* Professional Service Mode Selection */}'
t1 = """<AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-6">
                                        {/* Professional Service Mode Selection */}"""
text = text.replace(s1_start, t1)

# Step 1 End / Step 2 Start
s2_start = '{/* Smart Transport Selection - Moved below Fragile */}'
t2 = """<button type="button" onClick={() => { handleAnalyze(); setStep(2); }} className="w-full bg-brand-900 text-white py-4 rounded-[1.5rem] font-black shadow-lg">Confirm Details</button>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div key="step2" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-6">
                                        {/* Smart Transport Selection - Moved below Fragile */}"""
text = text.replace(s2_start, t2)

# Step 2 End / Step 3 Start
s3_start = '{/* Sender Section (For Guests) - HIDDEN to force login at end */}'
t3 = """<button type="button" onClick={() => setStep(3)} className="w-full bg-brand-900 text-white py-4 rounded-[1.5rem] font-black shadow-lg">Confirm Vehicle</button>
                                    </motion.div>
                                )}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-6">
                                        {/* Sender Section (For Guests) - HIDDEN to force login at end */}"""
text = text.replace(s3_start, t3)

# Step 3 End / Step 4 Start
# Finding Payment Method selector. Let's find "grid grid-cols-2 gap-3" above "bg-gray-50 text-gray-400"
s4_start = '<div className="grid grid-cols-2 gap-3">'
t4 = """<button type="button" onClick={() => setStep(4)} disabled={!recipientName || !recipientPhone} className="w-full bg-brand-900 disabled:bg-gray-300 text-white py-4 rounded-[1.5rem] font-black shadow-lg mt-4">Review & Pay</button>
                                    </motion.div>
                                )}
                                {step === 4 && (
                                    <motion.div key="step4" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">"""
text = text.replace(s4_start, t4, 1) # Only first match just in case! 
# BUT wait! Where is the "grid grid-cols-2 gap-3"? Let's verify line numbers. Let's not use a blind string.

with open('components/BookingForm.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
