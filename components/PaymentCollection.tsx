import React from 'react';
import { CreditCard, Wallet, ArrowRight, CheckCircle2, ShieldCheck, Zap, HandCoins, PhoneCall, DollarSign, RefreshCw, Layers, Smartphone, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PaymentCollection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleAction = () => {
        if (user?.role === 'business') {
            navigate('/business-dashboard', { state: { initialTab: 'OVERVIEW' } });
        } else {
            navigate('/business');
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen font-sans text-slate-200 overflow-hidden">
            {/* Glassmorphic Hero Section */}
            <div className="relative pt-32 pb-24 overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold mb-8 backdrop-blur-md"
                        >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Smart Settlement: Instant Liquidity
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]"
                        >
                            Financial <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">Settlement Layer.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
                        >
                            Bridge the gap between delivery and cash flow. Automated mobile money collection at the point of fulfillment with instant commercial settlement.
                        </motion.p>

                        {/* Financial Infographic Simulation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-video max-w-4xl mx-auto rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl p-8 shadow-2xl mb-16 overflow-hidden group"
                        >
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                            <div className="relative h-full flex items-center justify-around border border-white/5 rounded-[2rem] bg-[#0c1222]/80 p-6">
                                {[
                                    { label: 'Collection', icon: Smartphone, color: 'text-brand-400' },
                                    { label: 'Escrow', icon: Lock, color: 'text-blue-400' },
                                    { label: 'Settlement', icon: RefreshCw, color: 'text-brand-400' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className={`w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 transition-all group-hover:bg-slate-700/50 ${item.color}`}>
                                            {i === 0 && <HandCoins className="w-10 h-10" />}
                                            {i === 1 && <ShieldCheck className="w-10 h-10" />}
                                            {i === 2 && <RefreshCw className="w-10 h-10" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</span>
                                    </div>
                                ))}

                                {/* Flow Arrows */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 300">
                                    <motion.path
                                        d="M200,150 L260,150" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 6" fill="none"
                                        animate={{ strokeDashoffset: [-24, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    />
                                    <motion.path
                                        d="M340,150 L400,150" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 6" fill="none"
                                        animate={{ strokeDashoffset: [-24, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }}
                                    />
                                </svg>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <button
                                onClick={handleAction}
                                className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-2xl shadow-brand-900/40 flex items-center justify-center group"
                            >
                                Start Your Integration
                                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-10 py-5 bg-slate-800 text-white rounded-2xl font-black text-lg hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center group"
                            >
                                <PhoneCall className="w-5 h-5 mr-3 group-hover:animate-bounce" /> Talk to a Specialist
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Mission Section Text Band */}
            <div className="bg-brand-600 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 opacity-10"></div>
                <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-white text-3xl md:text-4xl font-black mb-8">Zero Liquidity Lag. Secure Trade.</h2>
                    <p className="text-xl md:text-2xl text-brand-50 leading-relaxed font-medium opacity-90">
                        Seamlessly close the loop between logistics and finance with automated mobile money collection and instant commercial settlement. We provide the secure liquidity layer that allows businesses to scale without the risks of physical cash.
                    </p>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: HandCoins,
                            title: "Cash-on-Delivery (COD)",
                            desc: "Automated mobile money collection at the point of delivery. Eliminate the risks of physical cash handling.",
                            color: "text-brand-400",
                            bg: "bg-brand-500/10"
                        },
                        {
                            icon: Zap,
                            title: "Instant Settlement",
                            desc: "Once the good is delivered and payment collected, the settlement to your bank happens instantly.",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10"
                        },
                        {
                            icon: ShieldCheck,
                            title: "Secure Escrow",
                            desc: "Payments are held in a secure infrastructure until fulfillment criteria are met, protecting all parties.",
                            color: "text-brand-400",
                            bg: "bg-brand-500/10"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-10 bg-slate-800/40 backdrop-blur-sm rounded-[2.5rem] border border-slate-700/50 hover:border-brand-500/30 transition-all group">
                            <div className={`w-14 h-14 ${feature.bg} flex items-center justify-center rounded-2xl ${feature.color} mb-8 transition-transform group-hover:scale-110`}>
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

            {/* How it Works / Dashboard Mockup */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="bg-slate-900 border border-slate-700/50 rounded-[3.5rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px]"></div>
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-1 mb-8">
                            <Layers className="w-4 h-4 text-brand-400" />
                            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Commercial Backend</span>
                        </div>
                        <h2 className="text-4xl font-black mb-8 text-white leading-tight">Bridging the Commercial Liquidity Gap</h2>
                        <ul className="space-y-8">
                            {[
                                { title: "Native M-Pesa Flow", desc: "Direct STK-Push integration triggered upon rider arrival at destination." },
                                { title: "Zero Courier Risks", desc: "Drivers never handle physical cash, drastically reducing theft and accounting errors." },
                                { title: "Automated Reconciliation", desc: "Every transaction is automatically mapped to your internal order IDs." }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-400 shrink-0 border border-white/5">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:w-1/2 relative w-full">
                        <div className="bg-[#0c1222] border border-white/5 rounded-3xl p-8 shadow-inner overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <div className="text-xs font-black text-brand-400 tracking-widest">REAL-TIME LIQUIDITY</div>
                                <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <div className="text-xs text-slate-500 mb-1 font-bold italic">Available for Payout</div>
                                    <div className="text-3xl font-black text-white">KES 242,500.00</div>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl text-xs">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                                <span className="text-slate-400 font-bold tracking-tight">ORDER #{9823 + i}</span>
                                            </div>
                                            <span className="text-brand-400 font-black">+ KES 4,200</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full py-4 bg-brand-600 rounded-xl font-black text-sm text-white shadow-lg shadow-brand-900/20 hover:bg-brand-500 transition-all">
                                    Trigger Instant Settlement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="bg-brand-600 rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-black mb-6">Stop Chasing Payments.</h2>
                        <p className="text-brand-50 text-xl mb-10 font-medium opacity-90">
                            Transform your logistics operations from a cost center into a high-velocity revenue engine.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => navigate('/business')}
                                className="px-10 py-5 bg-white text-brand-600 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-lg"
                            >
                                Get Started Now
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-10 py-5 bg-brand-500 text-white rounded-2xl font-black text-lg hover:bg-brand-400 transition-all flex items-center justify-center border border-brand-400"
                            >
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCollection;
