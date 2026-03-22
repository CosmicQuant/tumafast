$path = "c:\Users\ADMIN\Desktop\axon\components\BookingForm.tsx"
$content = Get-Content $path
# Line 2186 (index 2185) - distance / 1000
$content[2185] = $content[2185] -replace 'distance', 'distance / 1000'
# Line 2244 (index 2243) - remove premature </div>
if ($content[2243] -match '</div>') { $content[2243] = "" }
# Line 2362 (index 2361) - remove premature </div>
if ($content[2361] -match '</div>') { $content[2361] = "" }
$content | Set-Content $path
