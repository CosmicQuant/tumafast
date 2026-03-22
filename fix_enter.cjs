const fs = require('fs');
let code = fs.readFileSync('components/booking/BookingWizard.tsx', 'utf8');

const pickupStr = "value={data.pickup} onChange={e => handlePickupChange(e.target.value)}";
const pickupReplace = "value={data.pickup}\n" +
    "                                onChange={e => handlePickupChange(e.target.value)}\n" +
    "                                onKeyDown={(e) => {\n" +
    "                                    if (e.key === 'Enter') {\n" +
    "                                        e.preventDefault();\n" +
    "                                        if (pickupSuggestions && pickupSuggestions.length > 0) {\n" +
    "                                            handlePickupSelect(pickupSuggestions[0]);\n" +
    "                                        } else if (data.pickup && data.pickup.length > 2) {\n" +
    "                                            setActiveTab('dropoff');\n" +
    "                                        }\n" +
    "                                    }\n" +
    "                                }}";
code = code.replace(pickupStr, pickupReplace);

const dropoffStr = "value={data.dropoff} onChange={e => handleDropoffChange(e.target.value)}";
const dropoffReplace = "value={data.dropoff}\n" +
    "                                onChange={e => handleDropoffChange(e.target.value)}\n" +
    "                                onKeyDown={(e) => {\n" +
    "                                    if (e.key === 'Enter') {\n" +
    "                                        e.preventDefault();\n" +
    "                                        if (dropoffSuggestions && dropoffSuggestions.length > 0) {\n" +
    "                                            handleDropoffSelect(dropoffSuggestions[0]);\n" +
    "                                        }\n" +
    "                                    }\n" +
    "                                }}";
code = code.replace(dropoffStr, dropoffReplace);

fs.writeFileSync('components/booking/BookingWizard.tsx', code);
console.log("Done enter fix");
