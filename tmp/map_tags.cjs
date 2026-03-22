const fs = require('fs');
const content = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/BookingForm.tsx', 'utf8');

const lines = content.split('\n');
const stack = [];
const result = [];

lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Simplification: just count tags. 
    // This is safer than complex regex for nested stuff on one line for now.
    const openRegex = /<div(?![^>]*\/>)[^>]*>/g;
    const closeRegex = /<\/div>/g;

    let match;
    const tokens = [];

    // Process all matches in the line
    while ((match = openRegex.exec(line)) !== null) {
        tokens.push({ type: 'open', pos: match.index });
    }
    while ((match = closeRegex.exec(line)) !== null) {
        tokens.push({ type: 'close', pos: match.index });
    }

    tokens.sort((a, b) => a.pos - b.pos).forEach(token => {
        if (token.type === 'open') {
            stack.push(lineNum);
        } else {
            if (stack.length > 0) {
                const openLine = stack.pop();
                result.push(`${openLine} -> ${lineNum}`);
            } else {
                result.push(`EXTRA CLOSE at ${lineNum}`);
            }
        }
    });
});

stack.forEach(lineNum => {
    result.push(`UNCLOSED OPEN at ${lineNum}`);
});

fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/tmp/tag_map.txt', result.join('\n'));
console.log('Tag map written to tmp/tag_map.txt');
