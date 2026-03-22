import re

with open('components/BookingForm.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Close AnimatePresence before the final submit button.
btn_start = '''<button
                                            onClick={() => {
                                                if (!user) {'''
btn_repl = '''</motion.div>
                                )}</AnimatePresence>
<button
                                            onClick={() => {
                                                if (!user) {'''
text = text.replace(btn_start, btn_repl)

with open('components/BookingForm.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
