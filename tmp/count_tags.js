
const fs = require('fs');
const content = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/BookingForm.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Count non-self-closing divs: <div ... > (but not <div ... />)
    const openMatches = line.match(/<div(?![^>]*\/>)/g) || [];
    const closeMatches = line.match(/<\/div>/g) || [];
    
    balance += openMatches.length;
    balance -= closeMatches.length;
    
    if (openMatches.length > 0 || closeMatches.length > 0) {
        console.log(`L${lineNum}: +${openMatches.length} -${closeMatches.length} = ${balance}`);
    }
}
console.log('Final Balance:', balance);
