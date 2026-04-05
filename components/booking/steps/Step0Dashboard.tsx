import React from 'react';
import { motion } from 'framer-motion';
import { Box, Truck, Bike, Package, Clock, MapPin, Search } from 'lucide-react';
import { useBooking } from '../BookingContext';
import { useMapState } from '@/context/MapContext';
import { useAuth } from '@/context/AuthContext';
import { useUserOrders } from '../../../hooks/useOrders';

export const Step0Dashboard = () => {
    const { updateData, setStep } = useBooking();
    const { user } = useAuth();
    const { data: orders } = useUserOrders(user?.id ?? '');
    
    // Extract unique recent dropoff addresses from order history
    const recentDestinations = React.useMemo(() => {
        if (!orders) return [];
        const seen = new Set<string>();
        const results = [];
        for (const order of orders) {
            if (order.dropoff && !seen.has(order.dropoff)) {
                seen.add(order.dropoff);
                results.push({ address: order.dropoff, coords: order.dropoffCoords });
                if (results.length >= 4) break;
            }
        }
        return results;
    }, [orders]);

    const startWithService = (serviceType: 'Express' | 'Standard') => {
        updateData({ serviceType, vehicle: serviceType === 'Express' ? 'Boda Boda' : 'Minivan' });
        setStep(0);
    };

    return (
        <div className="space-y-4 px-2 pb-4">
            
            {/* Core Services Grid */}
            <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                    onClick={() => startWithService('Express')}
                    className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-left hover:shadow-lg transition-all"
                >
                    <div className="bg-white/20 p-2 rounded-xl text-white mb-3">
                        <Bike size={24} />
                    </div>
                    <span className="text-white font-bold text-sm">Express Delivery</span>
                    <span className="text-brand-100 text-[10px] mt-0.5">Quick & Lightweight</span>
                </button>
                <button
                    onClick={() => startWithService('Standard')}
                    className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-left hover:shadow-lg transition-all"
                >
                    <div className="bg-white/20 p-2 rounded-xl text-white mb-3">
                        <Box size={24} />
                    </div>
                    <span className="text-white font-bold text-sm">Standard Parcel</span>
                    <span className="text-blue-100 text-[10px] mt-0.5">Consolidated & Heavy</span>
                </button>
            </div>

            {/* "Where To?" Main Input trigger */}
            <button
                onClick={() => setStep(0)}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-4 flex items-center gap-3 transition-colors"
            >
                <Search className="text-brand-600" size={20} />
                <span className="text-gray-500 font-semibold text-lg">Where to?</span>
            </button>

            {/* Quick Tap Destinations */}
            {recentDestinations.length > 0 && (
                <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 px-1 mb-2">
                        Recent Destinations
                    </p>
                    <div className="flex flex-col gap-1">
                        {recentDestinations.map((dest, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    updateData({ dropoff: dest.address });
                                    setStep(0);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 text-left transition-colors"
                            >
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Clock size={16} className="text-gray-500 flex-shrink-0" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 truncate">{dest.address}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
