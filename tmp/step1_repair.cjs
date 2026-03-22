const fs = require('fs');
let code = fs.readFileSync('tmp/booking_full.tsx', 'utf8');

// 1. Types & State
code = code.replace(/distanceKm: number;/, 'distanceKm: number;\n    etaTime?: string;\n    calculatingRoute?: boolean;');
code = code.replace(/distanceKm: 14\.2,/, 'distanceKm: 0, calculatingRoute: false, etaTime: "",');

// 2. Imports
code = code.replace(/import \{ motion, AnimatePresence \} from 'framer-motion';/, "import { motion, AnimatePresence } from 'framer-motion';\nimport { mapService } from '../../services/mapService';\nimport { useMapState } from '@/context/MapContext';");

// 3. Hooks Injection
const hookInjection = `const handleUpdate = (updates: Partial<BookingState>) => setData(prev => ({ ...prev, ...updates }));

    const { pickupCoords, dropoffCoords, waypointCoords, setRoutePolyline, setIsMapSelecting, setActiveInput, setPickupCoords, setWaypointCoords } = useMapState();

    useEffect(() => {
        const calculateRoute = async () => {
             const allStops = [];
             if (waypointCoords && waypointCoords.length > 0) allStops.push(...waypointCoords);
             if (dropoffCoords) allStops.push(dropoffCoords);

             if (pickupCoords && allStops.length > 0) {
                 handleUpdate({ calculatingRoute: true });
                 try {
                     const route = await mapService.getFullyOptimizedRoute(pickupCoords, allStops, data.vehicle || 'Boda Boda');
                     if (route) {
                         setRoutePolyline(route.geometry);
                         const distKm = route.distance / 1000;
                         const now = new Date();
                         now.setSeconds(now.getSeconds() + route.duration);
                         const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                         handleUpdate({ distanceKm: distKm, etaTime: timeStr, calculatingRoute: false });
                     } else {
                         handleUpdate({ calculatingRoute: false });
                     }
                 } catch(e) {
                     handleUpdate({ calculatingRoute: false });
                 }
             } else {
                 setRoutePolyline(null);
                 handleUpdate({ distanceKm: 0, etaTime: '' });
             }
        };
        const timer = setTimeout(calculateRoute, 800);
        return () => clearTimeout(timer);
    }, [pickupCoords, waypointCoords, dropoffCoords, data.vehicle]);`;

code = code.replace(/const handleUpdate = \(updates: Partial<BookingState>\) => setData\(prev => \(\{ \.\.\.prev, \.\.\.updates \}\)\);/, hookInjection);

// 4. Proper AnimatePresence replace
const searchStart = '<AnimatePresence>';
const searchEnd = '</AnimatePresence>';

let startIndex = code.indexOf(searchStart, code.indexOf('data.distanceKm') - 100);
let endIndex = code.indexOf(searchEnd, startIndex) + searchEnd.length;

const newBlock = `<AnimatePresence>
                                {(data.distanceKm > 0 || data.calculatingRoute) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-brand-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] mb-1"
                                    >
                                        {data.calculatingRoute ? (
                                             <span className="text-[10px] font-bold text-brand-600 animate-pulse w-full text-center px-2">Calculating Route...</span>
                                        ) : (
                                            <>
                                                <span className="text-[11px] font-black text-gray-900 leading-none">{data.distanceKm.toFixed(1)} <span className="text-[8px] text-gray-500 font-medium tracking-tighter">km</span></span>
                                                <div className="w-[3px] h-[3px] bg-brand-200 rounded-full" />
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                                                    <span className="text-[11px] font-black text-brand-600 leading-none">{data.etaTime}</span>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>`;

code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);

fs.writeFileSync('tmp/booking_mod1.tsx', code, 'utf8');
console.log('done step 1 again');