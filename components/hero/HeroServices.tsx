import React from 'react';
import { Zap, Building2, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroServicesProps {
    onStartBooking: (prefill?: any) => void;
    onBusinessClick?: () => void;
}

export const HeroServices: React.FC<HeroServicesProps> = ({ onStartBooking, onBusinessClick }) => {
    return (
        <div className="py-20 bg-gray-50 border-t border-gray-100 pointer-events-auto">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Delivery Solutions for Everyone</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Whether you're sending a key across town or moving house across the country, we have the right vehicle for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Service 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                        onClick={() => onStartBooking()}
                    >
                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Express</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Perfect for documents, keys, food, and small parcels. Our vast network of Boda Boda riders ensures pickups in minutes.
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-brand-500 mr-2" /> 60 min city-wide delivery
                            </li>
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-brand-500 mr-2" /> Real-time GPS tracking
                            </li>
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-brand-500 mr-2" /> Starting at KES 50
                            </li>
                        </ul>
                        <button className="text-brand-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                            Book Boda Boda <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </motion.div>

                    {/* Service 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                        onClick={onBusinessClick}
                    >
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Logistics</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Scalable delivery solutions for e-commerce, retail, and healthcare. Streamline your operations with bulk scheduling and API integration.
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" /> Optimized Multi-stop Routes
                            </li>
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" /> Secure COD & Payment Handling
                            </li>
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" /> Dedicated Account Support
                            </li>
                        </ul>
                        <button className="text-blue-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                            Business Solutions <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </motion.div>

                    {/* Service 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                        onClick={() => onStartBooking()}
                    >
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Truck className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Heavy Cargo & Freight</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            From household moves to industrial freight. We provide Pickups, Vans, and 40ft Container Trailers for your largest loads.
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 mr-2" /> Professional Loading Teams
                            </li>
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 mr-2" /> Comprehensive Transit Insurance
                            </li>
                            <li className="flex items-center text-sm text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 mr-2" /> Nationwide Inter-county Haulage
                            </li>
                        </ul>
                        <button className="text-orange-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                            Book Freight <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
