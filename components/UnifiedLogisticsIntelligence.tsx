import React from 'react';
import { Eye, Shield, BarChart3, ArrowRight, MapPin, UserCheck, Activity, Lock, Globe, Server, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const UnifiedLogisticsIntelligence = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#020617] min-h-screen pt-24 pb-16 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8"
                    >
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Institutional-Grade Telemetry</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
                        Universal Logistics <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                            Intelligence Layer
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 leading-relaxed mb-12 font-medium max-w-2xl mx-auto">
                        End-to-end operational visibility powered by high-fidelity telemetry. We bridge the trust gap with verified identity, automated safety trails, and sub-second transit diagnostics.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/business')}
                            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center group"
                        >
                            Infrastructure Access
                            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-lg hover:bg-white/10 transition-all backdrop-blur-md"
                        >
                            Request Proof of Concept
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Capabilities */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Activity,
                            title: "Precision Telemetry",
                            desc: "Sub-second GPS updates, velocity diagnostics, and transit health monitoring across the entire fulfillment landscape.",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10"
                        },
                        {
                            icon: Shield,
                            title: "Cryptographic Trust",
                            desc: "Immutable audit trails for every dispatch. Biometric-verified handoffs and automated tamper-detection protocols.",
                            color: "text-indigo-400",
                            bg: "bg-indigo-500/10"
                        },
                        {
                            icon: BarChart3,
                            title: "Advanced Analytics",
                            desc: "Predictive bottleneck identification and efficiency scoring. Deep-tier fulfillment metrics for institutional decision-making.",
                            color: "text-cyan-400",
                            bg: "bg-cyan-500/10"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-10 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                            <div className={`w-14 h-14 ${feature.bg} flex items-center justify-center rounded-2xl ${feature.color} mb-8 border border-white/5`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Verification Infrastructure */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40">
                <div className="bg-slate-900/50 border border-white/10 rounded-[3.5rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]"></div>
                    <div className="lg:w-1/2 relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1 mb-8">
                            <Lock className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Security Framework v2.0</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">Securing the Physical <br />Supply Chain</h2>
                        <ul className="space-y-8">
                            {[
                                { icon: UserCheck, title: "Biometric Courier KYC", desc: "Rigorous digital identity verification for every node in the delivery network." },
                                { icon: MapPin, title: "Dynamic Geo-fencing", desc: "Automated event triggers for route deviation or unauthorized transit stops." },
                                { icon: Globe, title: "Universal Interop", desc: "Native integration with enterprise ERPs and institutional fulfillment systems." }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 border border-white/10">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="bg-[#0c1222] border border-white/10 rounded-3xl p-8 shadow-inner relative group">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <Terminal className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "TELEMETRY_LINK", status: "ACTIVE", color: "text-green-400" },
                                    { label: "ENCRYPTION_LAYER", status: "SSL_READY", color: "text-blue-400" },
                                    { label: "NODE_VERIFICATION", status: "VERIFIED", color: "text-indigo-400" },
                                    { label: "AUDIT_TRAIL", status: "SYNCED", color: "text-cyan-400" }
                                ].map((node, i) => (
                                    <div key={i} className="h-14 bg-white/5 rounded-xl flex items-center justify-between px-6 border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                            <span className="text-slate-300 text-sm font-mono">{node.label}</span>
                                        </div>
                                        <span className={`text-[10px] font-black font-mono px-2 py-1 bg-white/5 rounded ${node.color}`}>{node.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40 pb-32">
                <div className="text-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black mb-8 leading-[1.1]">Achieve Absolute <br />Operational Clarity</h2>
                        <p className="text-blue-50 text-xl mb-12 font-medium opacity-90">
                            Join the enterprises building their mission-critical logistics on Africa's most transparent fulfillment infrastructure.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button
                                onClick={() => navigate('/business')}
                                className="px-12 py-6 bg-white text-blue-700 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                Start Implementation
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-12 py-6 bg-blue-500/30 text-white border border-blue-400/50 rounded-3xl font-black text-xl hover:bg-blue-500/50 transition-all backdrop-blur-md"
                            >
                                Contact Institutional Sales
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedLogisticsIntelligence;
