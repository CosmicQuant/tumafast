const fs = require('fs');
let code = fs.readFileSync('tmp/booking_mod1.tsx', 'utf8');
const newStep1 = fs.readFileSync('tmp/step1_where_new.tsx', 'utf8');

const sStart = code.indexOf('const Step1Where = ({ data');
const sEnd = code.indexOf('const Step2What =') - 1;

if (sStart !== -1 && sEnd !== -1) {
    code = code.substring(0, sStart) + newStep1 + '\n\n' + code.substring(sEnd);
} else {
    console.log('Step1Where not found correctly.');
}

// Fix Next buttons
code = code.replace(/<button onClick=\{next\} disabled=\{!data.vehicle\} className="px-4 py-2 bg-brand-500/g, '<button onClick={next} disabled={!data.vehicle} className="px-4 py-2 bg-gray-900');
code = code.replace(/hover:bg-brand-400 disabled:opacity-50">/g, 'hover:bg-gray-800 disabled:opacity-50">');
code = code.replace(/<button onClick=\{next\} disabled=\{!data\.vehicle\}.*?<\/button>/m, match => match.replace('bg-brand-500', 'bg-gray-900').replace('hover:bg-brand-400', 'hover:bg-gray-800'));


// Fix Submit button
code = code.replace(/<button onClick=\{submit\} className="flex-1 py-3 bg-green-600/g, '<button onClick={submit} className="flex-1 py-3 bg-brand-600');
code = code.replace(/shadow-green-600\/30/g, 'shadow-brand-600/30');
code = code.replace(/hover:bg-green-500/g, 'hover:bg-brand-500');

fs.writeFileSync('components/booking/BookingWizard.tsx', code, 'utf8');
console.log('Done replacement');
