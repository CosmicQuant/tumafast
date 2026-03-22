
const fs = require('fs');
const path = 'c:/Users/ADMIN/Desktop/axon/components/BookingForm.tsx';
const content = fs.readFileSync(path, 'utf8');

// Strip multi-line comments {/* ... */} and // ...
let stripped = content;
stripped = stripped.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => ' '.repeat(match.length));
stripped = stripped.replace(/\/\/.*/g, (match) => ' '.repeat(match.length));

const lines = stripped.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    const openMatches = line.match(/<div(?![^>]*\/>)/g) || [];
    const closeMatches = line.match(/<\/div>/g) || [];
    
    if (openMatches.length > 0 || closeMatches.length > 0) {
        balance += openMatches.length;
        balance -= closeMatches.length;
        console.log(`L${lineNum}: +${openMatches.length} -${closeMatches.length} = ${balance}`);
    }
}
console.log('Final Balance:', balance);
