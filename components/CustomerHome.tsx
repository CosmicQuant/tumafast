import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserOrders } from '../hooks/useOrders';
import {
    Send, Zap, RotateCcw, Package, MapPin, Clock, User,
    ChevronRight, Truck, CheckCircle2, TrendingUp, Plus, Search,
    Navigation2
} from 'lucide-react';
import { ServiceType } from '../types';

const CustomerHome: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: orders } = useUserOrders(user?.id || '');

    const stats = useMemo(() => {
        if (!orders) return { active: 0, delivered: 0, totalSpent: 0 };
        const active = orders.filter(o => ['pending', 'driver_assigned', 'in_transit'].includes(o.status)).length;
        const delivered = orders.filter(o => o.status === 'delivered').length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.price || 0), 0);
        return { active, delivered, totalSpent };
    }, [orders]);

    const liveOrder = useMemo(() => {
        if (!orders) return null;
        return orders.find(o => o.status === 'in_transit') || orders.find(o => o.status === 'driver_assigned') || null;
    }, [orders]);

    const lastDelivered = useMemo(() => {
        if (!orders) return null;
        return orders.filter(o => o.status === 'delivered')
            .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())[0] || null;
    }, [orders]);

    const recentOrders = useMemo(() => {
        if (!orders) return [];
        return orders
            .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
            .slice(0, 3);
    }, [orders]);

    // Extract unique locations from order history for quick re-booking
    const frequentLocations = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        const locationMap = new Map<string, { address: string, coords: { lat: number; lng: number } | null, count: number, lastUsed: string }>();
        const sorted = [...orders].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
        for (const order of sorted) {
            // Add dropoff locations (more useful — destination reuse)
            if (order.dropoff) {
                const key = order.dropoff.split(',')[0].trim().toLowerCase();
                const existing = locationMap.get(key);
                if (existing) {
                    existing.count++;
                } else {
                    locationMap.set(key, {
                        address: order.dropoff,
                        coords: order.dropoffCoords || null,
                        count: 1,
                        lastUsed: order.createdAt || order.date
                    });
                }
            }
            // Add pickup locations
            if (order.pickup) {
                const key = order.pickup.split(',')[0].trim().toLowerCase();
                const existing = locationMap.get(key);
                if (existing) {
                    existing.count++;
                } else {
                    locationMap.set(key, {
                        address: order.pickup,
                        coords: order.pickupCoords || null,
                        count: 1,
                        lastUsed: order.createdAt || order.date
                    });
                }
            }
        }
        return Array.from(locationMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [orders]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_transit': return 'bg-blue-100 text-blue-700';
            case 'driver_assigned': return 'bg-indigo-100 text-indigo-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'delivered': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="max-w-xl mx-auto px-4 pt-6 sm:pt-10 space-y-6">

                {/* Greeting */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">What are you sending today?</p>
                </div>

                {/* "Where are you sending?" — Primary CTA */}
                <button
                    onClick={() => navigate('/book')}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group active:scale-[0.98]"
                >
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <Search className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-400 font-bold text-sm flex-1 text-left">Where are you sending?</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>

                {/* Quick Actions */}
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={() => navigate('/book')}
                        className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 transition-all whitespace-nowrap flex-shrink-0"
                    >
                        <Send className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-900">Send Parcel</span>
                    </button>
                    <button
                        onClick={() => navigate('/book', { state: { prefill: { serviceType: ServiceType.EXPRESS } } })}
                        className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-amber-200 hover:bg-amber-50 transition-all whitespace-nowrap flex-shrink-0"
                    >
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-slate-900">Express</span>
                    </button>
                    <button
                        onClick={() => navigate('/book', { state: { prefill: { activeTab: 'B' } } })}
                        className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-blue-200 hover:bg-blue-50 transition-all whitespace-nowrap flex-shrink-0"
                    >
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-slate-900">Heavy Cargo</span>
                    </button>
                    {lastDelivered && (
                        <button
                            onClick={() => navigate('/book', {
                                state: {
                                    prefill: {
                                        pickup: lastDelivered.pickup,
                                        dropoff: lastDelivered.dropoff,
                                        pickupCoords: lastDelivered.pickupCoords,
                                        dropoffCoords: lastDelivered.dropoffCoords,
                                        vehicle: lastDelivered.vehicle,
                                        serviceType: lastDelivered.serviceType,
                                        itemDescription: lastDelivered.itemDescription || lastDelivered.items?.itemDesc,
                                        sender: lastDelivered.sender,
                                        recipient: lastDelivered.recipient,
                                        stops: lastDelivered.stops,
                                        isReorder: true
                                    }
                                }
                            })}
                            className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-purple-200 hover:bg-purple-50 transition-all whitespace-nowrap flex-shrink-0"
                        >
                            <RotateCcw className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-bold text-slate-900">Reorder Last</span>
                        </button>
                    )}
                </div>

                {/* Location History — Quick send to previous places */}
                {frequentLocations.length > 0 && (
                    <div>
                        <h2 className="text-sm font-black text-slate-900 mb-2.5">Send again</h2>
                        <div className="space-y-1.5">
                            {frequentLocations.map((loc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate('/book', {
                                        state: {
                                            prefill: loc.coords
                                                ? { dropoff: loc.address, dropoffCoords: loc.coords }
                                                : { dropoff: loc.address }
                                        }
                                    })}
                                    className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left active:scale-[0.98]"
                                >
                                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
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

                {/* Live Order Hero Card */}
                {liveOrder && (
                    <div
                        onClick={() => navigate(`/track?id=${liveOrder.id}`)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-4 sm:p-5 cursor-pointer hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                                <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">
                                    {liveOrder.status === 'in_transit' ? 'In Transit' : 'Driver Assigned'}
                                </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-emerald-200" />
                        </div>
                        <h3 className="text-white font-black text-base sm:text-lg mb-1 truncate">
                            {liveOrder.items?.itemDesc || 'Package'}
                        </h3>
                        <div className="flex items-center gap-4 text-emerald-100 text-xs font-bold flex-wrap">
                            {liveOrder.driver?.name && (
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {liveOrder.driver.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {liveOrder.dropoff?.split(',')[0]}
                            </span>
                            {liveOrder.estimatedDuration && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    ETA {liveOrder.estimatedDuration}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Strip */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center mb-1.5">
                            <Truck className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xl font-black text-slate-900">{stats.active}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center mb-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-xl font-black text-slate-900">{stats.delivered}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivered</p>
                    </div>
                    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-1.5">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-xl font-black text-slate-900">
                            {stats.totalSpent >= 1000 ? `${(stats.totalSpent / 1000).toFixed(1)}k` : stats.totalSpent}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KES Spent</p>
                    </div>
                </div>

                {/* Recent Deliveries */}
                {recentOrders.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-black text-slate-900">Recent Deliveries</h2>
                            <button
                                onClick={() => navigate('/customer-dashboard?view=DELIVERIES')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                                See All <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recentOrders.map(order => (
                                <button
                                    key={order.id}
                                    onClick={() => navigate(`/track?id=${order.id}`)}
                                    className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left active:scale-[0.98]"
                                >
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {order.items?.itemDesc || 'Package'}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-medium truncate">
                                            {order.dropoff?.split(',')[0]}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end flex-shrink-0 gap-1">
                                        <span className="text-sm font-black text-slate-900">
                                            KES {order.price?.toLocaleString()}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state when no orders at all */}
                {(!orders || orders.length === 0) && (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-8 h-8 text-emerald-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No deliveries yet</h3>
                        <p className="text-sm text-gray-400 mb-4">Send your first package to get started</p>
                        <button
                            onClick={() => navigate('/book')}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Book a Delivery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerHome;
