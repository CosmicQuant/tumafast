import os
fp = 'components/booking/BookingWizard.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(r"category: \'A\', subCategory: \'\',", "category: 'A', subCategory: '',")

with open(fp, 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed backslashes")