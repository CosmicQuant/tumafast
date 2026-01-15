import React from 'react';
import { Eye, Shield, BarChart3, ArrowRight, MapPin, UserCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const UnifiedLogisticsIntelligence = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white pt-24 pb-16">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <div className="text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Logistics Visibility & Security
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                        Unified Logistics <span className="text-brand-600">Intelligence</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8 font-medium">
                        Mission-critical oversight with end-to-end tracking and immutable security protocols. We bridge the trust gap with verified identity, automated safety trails, and high-fidelity telemetry for every fulfillment movement.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            to="/business"
                            className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center group"
                        >
                            Start Your Integration
                            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core Pillars Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Real-Time Tracking */}
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 h-full flex flex-col">
                        <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600 mb-6 font-bold">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Precision Tracking</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Mission-critical telemetry providing end-to-end transparency. Monitor live GPS status, speed metrics, and delivery progress with sub-second accuracy.
                        </p>
                    </div>

                    {/* Delivery & Data Security */}
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 h-full flex flex-col">
                        <div className="w-12 h-12 bg-brand-50 flex items-center justify-center rounded-xl text-brand-600 mb-6">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Security & Traceability</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Verified driver KYC and immutable digital trails. Automated safety protocols, geo-fencing, and tamper-proof evidence ensuring absolute cargo security.
                        </p>
                    </div>

                    {/* Analytics & Insights */}
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 h-full flex flex-col">
                        <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600 mb-6">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Operational Insights</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Advanced fulfillment metrics to optimize costs and performance. Forecast bottlenecks and analyze safety scores with data-driven precision.
                        </p>
                    </div>
                </div>
            </div>

            {/* Verification Infrastructure */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6">Securing the Fulfillment Network</h2>
                        <ul className="space-y-6">
                            {[
                                { icon: UserCheck, title: "Verified KYC", desc: "Every driver undergoes rigorous biometric and background checks." },
                                { icon: MapPin, title: "Precision Geo-fencing", desc: "Automated alerts for unplanned stops or route deviations." },
                                { icon: Activity, title: "E-TIMS Ready", desc: "Immutable invoicing and tax-compliant digital records natively integrated." }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-brand-400 shrink-0">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                            <Activity className="w-32 h-32 text-brand-500 opacity-20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Ready for absolute operational clarity?</h2>
                    <button
                        onClick={() => navigate('/business')}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-brand-900/20"
                    >
                        Learn More about Business Layer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnifiedLogisticsIntelligence;
