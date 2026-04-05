const fs = require('fs');
let c = fs.readFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/steps/Step1Where.tsx', 'utf8');
if(!c.includes('Bike')) c = c.replace('RefreshCw }', 'RefreshCw, Bike, Box }');
c = c.replace(/placeholder=\\{data\\.waypoints\\.length > 0 \\? 'Final Destination' : 'Dropoff Location'\\}/g, 'placeholder={data.waypoints.length > 0 ? \\'Final Destination\\' : \\'?? Where are you sending to?\\'}');
c = c.replace(/\\s*\\{\\/\\* Recent Destinations \\(from order history\\) \\*\\/\\}\\r?\\n\\s*\\{showRecentDestinations && \\([\\s\\S]*?<\\/div>\\r?\\n\\s*\\)\\}/, '');
c = c.replace('{/* Route Builder Card */}', cta);
c = c.replace('<SuggestionsList suggestions={dropoffSuggestions} onSelect={handleDropoffSelect} />\\r?\\n                </div>\\r?\\n            </div>', '<SuggestionsList suggestions={dropoffSuggestions} onSelect={handleDropoffSelect} />\\n                </div>\\n            ' + hr);
c = c.replace(/\\s*\\{\\/\\* Saved Addresses horizontal scroll \\*\\/\\}\\r?\\n\\s*\\{user\\?\\.savedAddresses && user\\.savedAddresses\\.length > 0 && \\([\\s\\S]*?<\\/div>\\r?\\n\\s*\\)\\}/, '');
fs.writeFileSync('c:/Users/ADMIN/Desktop/axon/components/booking/steps/Step1Where.tsx', c, 'utf8');
