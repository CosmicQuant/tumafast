import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserOrders } from '../hooks/useOrders';
import { useMapState } from '../context/MapContext';
import { mapService } from '../services/mapService';
import {
    Package, MapPin, Clock,
    ChevronRight, Truck, Navigation2, Search, Bike, Zap, Container, Fuel, ArrowRight, BadgePercent
} from 'lucide-react';
import { ServiceType } from '../types';

const CustomerHome: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: orders } = useUserOrders(user?.id || '');
    const { userLocation } = useMapState();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Array<{ label: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Debounced Google Places search
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            const results = await mapService.getSuggestions(value);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setIsSearching(false);
        }, 300);
    }, []);

    // Resolve current location for auto-pickup
    const getCurrentLocationData = useCallback(async () => {
        const cached = localStorage.getItem('axon_last_known_location');
        if (cached) {
            try {
                const { lat, lng } = JSON.parse(cached);
                const address = await mapService.reverseGeocode(lat, lng);
                return { address: address || 'Current Location', coords: { lat, lng } };
            } catch { /* fall through */ }
        }
        if (userLocation) {
            const address = await mapService.reverseGeocode(userLocation.lat, userLocation.lng);
            return { address: address || 'Current Location', coords: userLocation };
        }
        return { address: 'Current Location', coords: null };
    }, [userLocation]);

    // Handle place selection from autocomplete
    const handlePlaceSelect = useCallback(async (placeLabel: string) => {
        setSearchQuery(placeLabel);
        setShowSuggestions(false);
        const geocoded = await mapService.geocodeAddress(placeLabel);
        const currentLoc = await getCurrentLocationData();
        navigate('/book', {
            state: {
                prefill: {
                    pickup: currentLoc.address,
                    ...(currentLoc.coords && { pickupCoords: currentLoc.coords }),
                    dropoff: geocoded?.formattedAddress || placeLabel,
                    ...(geocoded && { dropoffCoords: { lat: geocoded.lat, lng: geocoded.lng } })
                }
            }
        });
    }, [navigate, getCurrentLocationData]);

    // Handle "Send again" location click
    const handleSendAgain = useCallback(async (address: string, coords: { lat: number; lng: number } | null) => {
        const currentLoc = await getCurrentLocationData();
        navigate('/book', {
            state: {
                prefill: {
                    pickup: currentLoc.address,
                    ...(currentLoc.coords && { pickupCoords: currentLoc.coords }),
                    dropoff: address,
                    ...(coords && { dropoffCoords: coords })
                }
            }
        });
    }, [navigate, getCurrentLocationData]);

    // Handle quick action (Standard/Express/Boda) — resolve current location as pickup
    const handleQuickAction = useCallback(async (extra: Record<string, any>) => {
        const currentLoc = await getCurrentLocationData();
        navigate('/book', {
            state: {
                prefill: {
                    pickup: currentLoc.address,
                    ...(currentLoc.coords && { pickupCoords: currentLoc.coords }),
                    ...extra
                }
            }
        });
    }, [navigate, getCurrentLocationData]);

    // Active orders (in_transit, driver_assigned, pending) — sorted by urgency
    const activeOrders = useMemo(() => {
        if (!orders) return [];
        return orders
            .filter(o => ['in_transit', 'driver_assigned', 'pending'].includes(o.status))
            .sort((a, b) => {
                const priority: Record<string, number> = { in_transit: 0, driver_assigned: 1, pending: 2 };
                return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
            });
    }, [orders]);

    // Frequent dropoff destinations for quick re-booking
    const frequentLocations = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        const locationMap = new Map<string, { address: string, coords: { lat: number; lng: number } | null, count: number }>();
        for (const order of orders) {
            if (order.dropoff) {
                const key = order.dropoff.split(',')[0].trim().toLowerCase();
                const existing = locationMap.get(key);
                if (existing) existing.count++;
                else locationMap.set(key, { address: order.dropoff, coords: order.dropoffCoords || null, count: 1 });
            }
        }
        return Array.from(locationMap.values()).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [orders]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'in_transit': return 'In Transit';
            case 'driver_assigned': return 'Driver Assigned';
            case 'pending': return 'Pending';
            default: return status.replace('_', ' ');
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'in_transit': return 'bg-blue-500';
            case 'driver_assigned': return 'bg-indigo-500';
            case 'pending': return 'bg-amber-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            <div className="max-w-xl mx-auto px-4 pt-20 space-y-5">

                {/* Greeting */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">Trucks, Containers &amp; Tankers — On Demand</p>
                </div>

                {/* ── Hero Banner — primary CTA ── */}
                <button
                    onClick={() => handleQuickAction({ serviceType: ServiceType.EXPRESS })}
                    className="relative w-full overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-5 text-left shadow-xl active:scale-[0.98] transition-transform group"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-[0.07]">
                        <Truck className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Dedicated Transport</p>
                        <h2 className="text-white text-xl font-black leading-tight">Need a Truck?</h2>
                        <p className="text-white/50 text-xs font-semibold mt-1">Lorries · Containers · Tippers · Tankers — instant pricing</p>
                        <div className="mt-3.5 inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors group-hover:bg-emerald-400">
                            Get a Quote <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </button>

                {/* ── Vehicle Category Grid — 2×2 heavy vehicles ── */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Lorry */}
                    <button
                        onClick={() => handleQuickAction({ vehicle: 'Lorry 10T' })}
                        className="relative overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-3.5 text-left shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-[0.97] group"
                    >
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <Truck className="w-14 h-14 text-white" />
                        </div>
                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white/25 transition-colors">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-black text-[13px] leading-tight">Lorry 10T</p>
                        <p className="text-slate-300 text-[10px] font-semibold mt-0.5">Up to 10,000 kg</p>
                    </button>

                    {/* Container */}
                    <button
                        onClick={() => handleQuickAction({ vehicle: 'Container' })}
                        className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-3.5 text-left shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-[0.97] group"
                    >
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <Container className="w-14 h-14 text-white" />
                        </div>
                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white/25 transition-colors">
                            <Container className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-black text-[13px] leading-tight">Container</p>
                        <p className="text-blue-200 text-[10px] font-semibold mt-0.5">20ft &amp; 40ft</p>
                    </button>

                    {/* Tipper */}
                    <button
                        onClick={() => handleQuickAction({ vehicle: 'Tipper' })}
                        className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-3.5 text-left shadow-lg shadow-amber-100 hover:shadow-amber-200 transition-all active:scale-[0.97] group"
                    >
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <Truck className="w-14 h-14 text-white" />
                        </div>
                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white/25 transition-colors">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-black text-[13px] leading-tight">Tipper</p>
                        <p className="text-amber-100 text-[10px] font-semibold mt-0.5">Sand, ballast, stone</p>
                    </button>

                    {/* Tanker — LPG & Petroleum */}
                    <button
                        onClick={() => handleQuickAction({ vehicle: 'Tanker' })}
                        className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-red-700 rounded-2xl p-3.5 text-left shadow-lg shadow-rose-100 hover:shadow-rose-200 transition-all active:scale-[0.97] group"
                    >
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <Fuel className="w-14 h-14 text-white" />
                        </div>
                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white/25 transition-colors">
                            <Fuel className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-black text-[13px] leading-tight">Tanker</p>
                        <p className="text-rose-200 text-[10px] font-semibold mt-0.5">LPG &amp; Petroleum</p>
                    </button>
                </div>

                {/* ── Standard Consolidated — lowest price selling point ── */}
                <button
                    onClick={() => handleQuickAction({ serviceType: ServiceType.STANDARD })}
                    className="relative w-full overflow-hidden bg-white border-2 border-emerald-200 rounded-2xl p-4 text-left shadow-sm hover:shadow-md hover:border-emerald-300 transition-all active:scale-[0.98] group"
                >
                    <div className="absolute -right-3 -bottom-3 opacity-[0.06]">
                        <Package className="w-20 h-20 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                        <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                            <Package className="w-5.5 h-5.5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-slate-900 font-black text-sm">Standard Consolidated</p>
                                <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                                    <BadgePercent className="w-2.5 h-2.5" /> LOWEST PRICE
                                </span>
                            </div>
                            <p className="text-gray-400 text-[11px] font-semibold mt-0.5">Parcels &amp; boxes · Same-day · Share a truck, save more</p>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 text-gray-300 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
                    </div>
                </button>

                {/* ── Boda — compact small card ── */}
                <button
                    onClick={() => handleQuickAction({ vehicle: 'Boda Boda' })}
                    className="w-full flex items-center gap-3 bg-white rounded-xl px-3.5 py-2.5 border border-gray-150 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left active:scale-[0.98]"
                >
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bike className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">Boda Boda</p>
                        <p className="text-[10px] text-gray-400 font-medium">Small parcels · Motorbike</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>

                {/* Search Input — Google Places Autocomplete */}
                <div ref={searchRef} className="relative">
                    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-gray-200 shadow-sm focus-within:border-emerald-300 focus-within:shadow-md transition-all">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Where are you sending?"
                            className="flex-1 text-sm font-medium text-slate-900 placeholder:text-gray-400 outline-none bg-transparent"
                        />
                        {isSearching && (
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                            {suggestions.map((sug, idx) => (
                                <button
                                    key={idx}
                                    onMouseDown={() => handlePlaceSelect(sug.label)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                                >
                                    <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-800 truncate">{sug.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location History — Send again */}
                {frequentLocations.length > 0 && (
                    <div>
                        <h2 className="text-sm font-black text-slate-900 mb-2">Send again</h2>
                        <div className="space-y-1.5">
                            {frequentLocations.map((loc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendAgain(loc.address, loc.coords)}
                                    className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {loc.count >= 3 ? (
                                            <Navigation2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{loc.address.split(',')[0]}</p>
                                        <p className="text-[11px] text-gray-400 font-medium truncate">{loc.address}</p>
                                    </div>
                                    {loc.count >= 2 && (
                                        <span className="text-[10px] font-bold text-gray-300 flex-shrink-0">{loc.count}x</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Orders — compact summary */}
                {activeOrders.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-black text-slate-900">Your deliveries</h2>
                            <button
                                onClick={() => navigate('/customer-dashboard?view=DELIVERIES')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                            >
                                All <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            {activeOrders.slice(0, 3).map(order => (
                                <button
                                    key={order.id}
                                    onClick={() => navigate(`/track?id=${order.id}`)}
                                    className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left active:scale-[0.98]"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(order.status)} ${order.status === 'in_transit' ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {order.dropoff?.split(',')[0] || 'Delivery'}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-medium">
                                            {getStatusLabel(order.status)}
                                            {order.driver?.name ? ` · ${order.driver.name}` : ''}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state when no orders at all */}
                {(!orders || orders.length === 0) && (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-7 h-7 text-emerald-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No deliveries yet</h3>
                        <p className="text-sm text-gray-400">Send your first package to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerHome;
