import os

fp = 'components/BookingForm.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

# Edit 1: Header Optimization
old_header = '<span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50/50 px-2 py-0.5 rounded-md">Step {step + 1} of 5</span>'
new_header = '''{(() => {
                            const STEP_INFO = [
                                { title: 'Route Validation', icon: Navigation },
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
                        })()}'''

if old_header in text:
    text = text.replace(old_header, new_header)
    print("Header replaced successfully")
else:
    print('Failed to find old header')

# Edit 2: Remove H2s
h2_route = '<h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5"><Navigation className="text-brand-600" size={18}/> Route Validation</h2>'
h2_cargo = '<h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5"><Box className="text-brand-600" size={18}/> Cargo Type</h2>'
h2_vehicle = '<div className="flex items-center justify-between">\n                <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5"><Truck className="text-brand-600" size={18}/> Choose Vehicle</h2>\n                <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-md">{data.distanceKm}km</span>\n            </div>'
h2_receiver = '<h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5"><User className="text-brand-600" size={18}/> Receiver Details</h2>'
h2_payment = '<h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5"><Banknote className="text-brand-600" size={18}/> Payment Option</h2>'

text = text.replace(h2_route, '')
text = text.replace(h2_cargo, '')
text = text.replace(h2_vehicle, '<div className="flex items-center justify-end -mt-0 mb-3"><span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded-md">{data.distanceKm}km Total Route</span></div>')
text = text.replace(h2_receiver, '')
text = text.replace(h2_payment, '')

with open(fp, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done header changes')