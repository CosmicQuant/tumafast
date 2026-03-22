import re

with open('components/booking/BookingWizard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'<div className="([^"]*?)">', text):
    cls = m.group(1)
    if 'flex gap-2' in cls:
        print(cls)
