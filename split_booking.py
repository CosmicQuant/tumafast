import re

with open('components/BookingForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

header_old = '''<div className="w-12 h-1.5 bg-gray-300/50 rounded-full group-hover:bg-gray-400/50 transition-colors mb-2" />'''
header_new = '''<div className="w-12 h-1.5 bg-gray-300/50 rounded-full group-hover:bg-gray-400/50 transition-colors mb-2" />
                            {!isCollapsed && (
                                <div className="w-full px-6 flex items-center justify-between mt-2">
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
                            )}'''
content = content.replace(header_old, header_new)

form_body_start = '''<div className="space-y-6 animate-in fade-in duration-500">'''
form_body_end = '''<div ref={formBottomRef} className="h-4" />'''

body_regex = re.compile(re.escape(form_body_start) + r"(.*?)" + re.escape(form_body_end), re.DOTALL)
match = body_regex.search(content)

if match:
    body = match.group(1)
    
    vehicle_start_idx = body.find('{/* Smart Transport Selection - Moved below Fragile */}')
    if vehicle_start_idx == -1: vehicle_start_idx = body.find('Select Vehicle</p>') - 200 # fallback
    
    sender_start_idx = body.find('{/* Sender Details - Pre-filled if user is logged in */}')
    payment_start_idx = body.find('{/* Payment Method - Complete Overhaul */}')
    
    step1 = body[:vehicle_start_idx]
    
    step1_btn = '''
        <button type="button" onClick={() => { handleAnalyze(); setStep(2); }} className="w-full bg-brand-900 text-white py-4 rounded-[1.5rem] font-black shadow-lg">Confirm Locations & Items</button>
    '''
    
    step2 = body[vehicle_start_idx:sender_start_idx]
    step2_btn = '''
        <button type="button" onClick={() => setStep(3)} className="w-full bg-brand-900 text-white py-4 rounded-[1.5rem] font-black shadow-lg mt-4">Confirm Vehicle & Weight</button>
    '''
    
    step3 = body[sender_start_idx:payment_start_idx]
    step3_btn = '''
        <button type="button" onClick={() => setStep(4)} disabled={!recipientName || !recipientPhone} className="w-full bg-brand-900 disabled:bg-gray-300 text-white py-4 rounded-[1.5rem] font-black shadow-lg mt-4">Proceed to Payment</button>
    '''
    
    step4 = body[payment_start_idx:]
    
    new_body = f'''<div className="animate-in fade-in duration-500 relative">
    <AnimatePresence mode="wait">
        {{step === 1 && (
            <motion.div key="step1" initial={{{{opacity:0, x:-20}}}} animate={{{{opacity:1, x:0}}}} exit={{{{opacity:0, x:20}}}} className="space-y-6">
                {step1}
                {step1_btn}
            </motion.div>
        )}}
        
        {{step === 2 && (
            <motion.div key="step2" initial={{{{opacity:0, x:-20}}}} animate={{{{opacity:1, x:0}}}} exit={{{{opacity:0, x:20}}}} className="space-y-6">
                {step2}
                {step2_btn}
            </motion.div>
        )}}

        {{step === 3 && (
            <motion.div key="step3" initial={{{{opacity:0, x:-20}}}} animate={{{{opacity:1, x:0}}}} exit={{{{opacity:0, x:20}}}} className="space-y-6">
                {step3}
                {step3_btn}
            </motion.div>
        )}}

        {{step === 4 && (
            <motion.div key="step4" initial={{{{opacity:0, x:-20}}}} animate={{{{opacity:1, x:0}}}} exit={{{{opacity:0, x:20}}}} className="space-y-6">
                {step4}
            </motion.div>
        )}}
    </AnimatePresence>
'''
    content = content[:match.start()] + new_body + "\\n" + form_body_end + content[match.end():]
    
    with open('components/BookingForm.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully transformed to Framer Motion")
else:
    print("Could not find the body start/end markers")
