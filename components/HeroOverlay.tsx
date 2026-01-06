import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Smartphone, MapPin, Building2, Home, Package, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

interface HeroOverlayProps {
    isVisible: boolean;
    onSelectDestination?: (destination: string) => void;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ isVisible, onSelectDestination }) => {
    const { user } = useAuth();
    const [historyDestinations, setHistoryDestinations] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const orders = await orderService.getUserOrders(user.id);
                    const unique = Array.from(new Set(orders.map(o => o.dropoff)))
                        .slice(0, 3)
                        .map(label => ({ label, icon: MapPin }));
                    setHistoryDestinations(unique);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        fetchHistory();
    }, [user]);

    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center px-4 animate-in fade-in duration-700">
            <div className="max-w-2xl text-center">
                {/* Headline */}
                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm mb-6">
                    Send anything, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-green-500">Fast & Reliable.</span>
                </h1>

                <p className="max-w-lg mx-auto text-base sm:text-lg text-slate-600 font-bold leading-relaxed mb-8">
                    From Boda Boda errands to 3-tonne lorry loads. <br className="hidden sm:block" />
                    Connect with verified drivers in seconds.
                </p>

                {/* Quick Tap Destinations - Added for visibility when collapsed */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 pointer-events-auto">
                    {(historyDestinations.length > 0 ? historyDestinations : [
                        { label: 'Westlands', icon: Building2 },
                        { label: 'CBD', icon: MapPin },
                        { label: 'Kilimani', icon: Home }
                    ]).map((dest) => (
                        <button
                            key={dest.label}
                            onClick={() => onSelectDestination?.(dest.label)}
                            className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-sm border border-white/50 rounded-full text-[10px] font-black text-slate-700 shadow-lg hover:bg-brand-50 hover:text-brand-600 transition-all active:scale-95"
                        >
                            <dest.icon className="w-3 h-3 text-brand-500" />
                            <span className="truncate max-w-[80px] uppercase tracking-widest">{dest.label.split(',')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Badge - Moved below headline to avoid drawer overlap */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white backdrop-blur-md border border-white/50 shadow-xl text-brand-700 text-[10px] font-bold tracking-widest uppercase mb-10">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    Live in Nairobi • Mombasa • Kisumu
                </div>

                {/* Quick Features */}
                <div className="flex flex-wrap justify-center gap-3">
                    <div className="flex items-center space-x-2 text-slate-600 font-bold text-[10px] bg-white backdrop-blur-xl px-4 py-2 rounded-full border border-white/50 shadow-lg">
                        <Clock className="w-3 h-3 text-brand-500" />
                        <span>Under 60 min pickup</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 font-bold text-[10px] bg-white backdrop-blur-xl px-4 py-2 rounded-full border border-white/50 shadow-lg">
                        <ShieldCheck className="w-3 h-3 text-brand-500" />
                        <span>Goods Insured</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 font-bold text-[10px] bg-white backdrop-blur-xl px-4 py-2 rounded-full border border-white/50 shadow-lg">
                        <Smartphone className="w-3 h-3 text-brand-500" />
                        <span>Real-time Tracking</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroOverlay;
