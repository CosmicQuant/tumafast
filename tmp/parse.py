import re
with open('c:/Users/ADMIN/Desktop/axon/tmp/booking_return.txt', 'r', encoding='utf-8') as f:
    text = f.read()

marks = {
    'drag_zone_end': text.find('<div\\n                        ref={formContainerRef}'),
    'service_mode': text.find('{/* Professional Service Mode Selection */}'),
    'pickup_start': text.find('<div className="relative">\\n                                        <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">\\n                                            <MapPin className="text-green-500'),
    'time_start': text.find('<div className="space-y-4 pt-2">\\n                                <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">'),
    'cargo_start': text.find('<div className="space-y-6 pt-4">\\n                                {/* 1. Item Description & AI Analysis */}'),
    'vehicle_start': text.find('<div\\n                                            ref={vehicleScrollRef}'),
    'tonnage_start': text.find('{/* Tonnage Selector for Truck/Lorry/Trailer */}'),
    'contact_start': text.find('{/* Contact Details Section */}'),
    'payment_start': text.find('{/* Payment Section */}'),
    'end_form': text.rfind('</form>')
}
for k, v in marks.items():
    print(f'{k}: {v}')
