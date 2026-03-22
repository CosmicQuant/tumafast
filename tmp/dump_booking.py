with open('components/BookingForm.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
import re
idx1 = text.find('dropoff')
if idx1 != -1:
    print("Found dropoff")
    match = re.search(r'key="dropoff".*?</motion\.div>', text, re.DOTALL)
    if match: print(match.group(0)[:1500])
    else: print("no match")