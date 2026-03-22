import os
import re

fp = 'components/booking/BookingWizard.tsx'
with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

# I want to read the code of Step1Where and Step2What to replace them
idx1 = text.find('const Step1Where')
idx2 = text.find('const Step3Vehicle')
if idx1 != -1 and idx2 != -1:
    with open('tmp/dump_steps.txt', 'w', encoding='utf-8') as out:
        out.write(text[idx1:idx2])
print("Dumped steps")