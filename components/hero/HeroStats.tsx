import React from 'react';
import { Package, Users, Map, Star } from 'lucide-react';

export const HeroStats: React.FC = () => {
    return (
        <div className="border-y border-gray-100 bg-slate-50/50 py-16 pointer-events-auto">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <Package className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mb-1">50k+</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Deliveries Completed</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mb-1">2,500+</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Registered Drivers</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                        <Map className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mb-1">15</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Cities Covered</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mb-1">4.8/5</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Customer Rating</div>
                </div>
            </div>
        </div>
    );
};
