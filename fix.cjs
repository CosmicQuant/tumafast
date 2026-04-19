const fs = require('fs');
let s = fs.readFileSync('components/CarrierNetworkSection.tsx', 'utf8');
s = s.replace(/<div className=\{\\\\\\\\\}/g, '<div className={\\\}>');
s = s.replace(/className=\{\\\\\\i/g, 'className={\i');
s = s.replace(/rounded-full\\\\}/g, 'rounded-full\\}');
s = s.replace(/hover:\\\\\\ /g, 'hover:\ ');
s = s.replace(/colors \\\\\\}/g, 'colors \\}');
s = s.replace(/gradient-to-br \\\\\\ /g, 'gradient-to-br \ ');
s = s.replace(/Delay: \\\\\\\\s\\\\/g, 'Delay: \\s\');
s = s.replace(/lex w-full \\\\\\\\}/g, 'flex w-full \\}');
s = s.replace(/className=\{\\\\\\\n/g, 'className={\');
fs.writeFileSync('components/CarrierNetworkSection.tsx', s);

