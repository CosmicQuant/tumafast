
const fs = require('fs');
const path = 'c:/Users/ADMIN/Desktop/axon/components/BookingForm.tsx';
console.log('Reading file:', path);
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Count non-self-closing divs: <div ... > (but not <div ... />)
    const openMatches = line.match(/<div(?![^>]*\/>)/g) || [];
    const closeMatches = line.match(/<\/div>/g) || [];
    
    if (openMatches.length > 0 || closeMatches.length > 0) {
        balance += openMatches.length;
        balance -= closeMatches.length;
        console.log(`L${lineNum}: +${openMatches.length} -${closeMatches.length} = ${balance}`);
    }
}
console.log('Final Balance:', balance);
