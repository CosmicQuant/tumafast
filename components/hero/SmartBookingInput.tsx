import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, MapPin, Building2, Home, Navigation, Package, Briefcase, Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { parseNaturalLanguageOrder } from '../../services/geminiService';
import { mapService } from '../../services/mapService';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';

interface SmartBookingInputProps {
    onStartBooking: (prefill?: any) => void;
    onBusinessClick?: () => void;
}

const PLACEHOLDERS = [
    "e.g. Laptop from Westlands to CBD...",
    "e.g. Containers from Mombasa port to warehouse in Nairobi Industrial Area...",
    "e.g. 20 90kg sacks of potatoes from Meru to Muthurwa...",
    "e.g. Dawa from Chemist to South B...",
    "e.g. Pick docs Upperhill drop Karen..."
];

export const SmartBookingInput: React.FC<SmartBookingInputProps> = ({ onStartBooking, onBusinessClick }) => {
    const { user } = useAuth();
    const [quickInput, setQuickInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [historyDestinations, setHistoryDestinations] = useState<any[]>([]);

    // Placeholder Typing Effect State
    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fetch User History for Quick Destinations
    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const orders = await orderService.getUserOrders(user.id);
                    // Extract unique dropoff locations, limit to 5
                    const uniqueDestinations = Array.from(new Set(orders.map(o => o.dropoff)))
                        .slice(0, 5)
                        .map(label => ({
                            label,
                            icon: MapPin,
                            isHistory: true
                        }));

                    if (uniqueDestinations.length > 0) {
                        setHistoryDestinations(uniqueDestinations);
                    }
                } catch (e) {
                    console.error("Error fetching destination history:", e);
                }
            }
        };
        fetchHistory();
    }, [user]);

    const requestUserLocation = (): Promise<{ lat: number, lng: number } | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    };

    // Typing Effect Logic
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const i = loopNum % PLACEHOLDERS.length;
        const fullText = PLACEHOLDERS[i];

        if (isDeleting) {
            timer = setTimeout(() => {
                setPlaceholder(prev => prev.slice(0, -1));
                if (placeholder.length <= 1) {
                    setIsDeleting(false);
                    setLoopNum(l => l + 1);
                }
            }, 10);
        } else {
            if (placeholder.length < fullText.length) {
                timer = setTimeout(() => {
                    setPlaceholder(fullText.slice(0, placeholder.length + 1));
                }, 20);
            } else {
                timer = setTimeout(() => {
                    setIsDeleting(true);
                }, 1500);
            }
        }
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, loopNum]);

    // Auto-grow effect
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [quickInput]);

    const performSearch = async (input: string) => {
        if (!input.trim()) {
            onStartBooking();
            return;
        }

        setIsAnalyzing(true);
        const result = await parseNaturalLanguageOrder(input);

        if (result) {
            // Professionalize locations using Google Maps
            const prefill: any = { ...result };

            // If no pickup specified, try to get current location
            if (!result.pickup || result.pickup.toLowerCase().includes('current location')) {
                const coords = await requestUserLocation();
                if (coords) {
                    const address = await mapService.reverseGeocode(coords.lat, coords.lng);
                    if (address) {
                        prefill.pickup = address;
                        prefill.pickupCoords = coords;
                    }
                }
            } else {
                const geo = await mapService.geocodeAddress(result.pickup);
                if (geo) {
                    prefill.pickup = geo.formattedAddress;
                    prefill.pickupCoords = { lat: geo.lat, lng: geo.lng };
                }
            }

            if (result.dropoff) {
                const geo = await mapService.geocodeAddress(result.dropoff);
                if (geo) {
                    prefill.dropoff = geo.formattedAddress;
                    prefill.dropoffCoords = { lat: geo.lat, lng: geo.lng };
                }
            }

            setIsAnalyzing(false);
            onStartBooking(prefill);
        } else {
            setIsAnalyzing(false);
            // Fallback
            const coords = await requestUserLocation();
            let pickup = '';
            if (coords) {
                const address = await mapService.reverseGeocode(coords.lat, coords.lng);
                if (address) pickup = address;
            }
            onStartBooking({ itemDescription: input, pickup, pickupCoords: coords });
        }
    };

    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(quickInput);
    };

    const handleSendAnything = async () => {
        setQuickInput('Send a package from my current location');
        setIsAnalyzing(true);
        const coords = await requestUserLocation();
        let pickup = '';
        if (coords) {
            const address = await mapService.reverseGeocode(coords.lat, coords.lng);
            if (address) {
                pickup = address;
                setQuickInput(`Send a package from ${address}`);
            }
        }
        setIsAnalyzing(false);
        onStartBooking({
            pickup: pickup,
            pickupCoords: coords,
            itemDescription: 'Package'
        });
    };

    return (
        <div className="w-full">
            {/* Service Type Quick Select */}
            <div className="max-w-2xl mx-auto w-full mb-4 sm:mb-6 flex justify-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                {[
                    { id: 'send', icon: Package, label: 'Send Anything', color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-600', desc: 'Personal & Errands', action: handleSendAnything },
                    { id: 'business', icon: Briefcase, label: 'Business', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600', desc: 'Bulk & Corporate', action: () => onBusinessClick?.() },
                ].map((s) => (
                    <button
                        key={s.id}
                        disabled={isAnalyzing}
                        onClick={s.action}
                        className={`flex-1 flex flex-col items-center py-2 px-1 sm:py-4 sm:px-6 rounded-xl sm:rounded-[2rem] border-2 ${s.border} ${s.bg} hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="absolute top-0 right-0 p-1 sm:p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <s.icon className="w-6 h-6 sm:w-12 sm:h-12" />
                        </div>
                        <s.icon className={`w-4 h-4 sm:w-7 sm:h-7 mb-1 sm:mb-2 ${s.color} group-hover:scale-110 transition-transform duration-300`} />
                        <span className={`text-[8px] sm:text-xs font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
                        <span className={`text-[6px] sm:text-[8px] font-bold uppercase tracking-tighter mt-0.5 text-slate-600`}>{s.desc}</span>
                    </button>
                ))}
            </div>

            {/* Smart Input - Bolt Style */}
            <div className="max-w-2xl mx-auto w-full pt-1 mb-4 sm:mb-8">
                <form onSubmit={handleQuickSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-green-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl p-1.5 sm:p-2 flex items-center gap-2 border border-gray-100 focus-within:ring-2 focus-within:ring-brand-500/50 transition-all duration-300">
                        <div className="pl-3 sm:pl-4 self-start pt-[20px] sm:pt-[30px]">
                            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                        </div>
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-slate-400 text-sm sm:text-lg font-medium py-[16px] sm:py-[26px] resize-none overflow-hidden leading-relaxed"
                            placeholder={placeholder || "Where to?"}
                            value={quickInput}
                            onChange={(e) => setQuickInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isAnalyzing || !quickInput.trim()}
                            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all font-bold text-xs sm:text-sm mr-1 sm:mr-2 whitespace-nowrap shadow-md hover:shadow-lg self-end mb-1.5 sm:mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Send</span> <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Quick Tap Destinations */}
                <div className="mt-8 w-full max-w-2xl mx-auto">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 text-center">Quick Tap Destinations</p>
                    <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {(historyDestinations.length > 0 ? historyDestinations : [
                            { label: 'Nairobi', icon: MapPin },
                            { label: 'Mombasa', icon: MapPin },
                            { label: 'CBD', icon: MapPin },
                            { label: 'Westlands', icon: Building2 },
                            { label: 'Kilimani', icon: Home },
                            { label: 'Upper Hill', icon: Building2 },
                            { label: 'JKIA', icon: Navigation }
                        ]).map((dest) => (
                            <button
                                key={dest.label}
                                onClick={() => {
                                    const query = `Send package to ${dest.label}`;
                                    setQuickInput(query);
                                    performSearch(query);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all shadow-sm active:scale-95"
                            >
                                <dest.icon className="w-3 h-3 text-brand-500" />
                                <span className="truncate max-w-[120px]">{dest.label.split(',')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Features */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-8">
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs sm:text-sm bg-white/[0.11] backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-default">
                        <Clock className="w-4 h-4 text-brand-500" />
                        <span>Under 60 min pickup</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs sm:text-sm bg-white/[0.11] backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-default">
                        <ShieldCheck className="w-4 h-4 text-brand-500" />
                        <span>Goods Insured</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs sm:text-sm bg-white/[0.11] backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-default">
                        <Smartphone className="w-4 h-4 text-brand-500" />
                        <span>Real-time Tracking</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
