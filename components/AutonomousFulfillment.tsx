import React from 'react';
import { Brain, Zap, BarChart3, ArrowRight, ShieldCheck, Globe, Cpu, Network, Activity, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AutonomousFulfillment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isBusiness = user?.role === 'business';

    const handleAction = () => {
        if (isBusiness) {
            navigate('/business-dashboard', { state: { initialTab: 'BULK' } });
        } else {
            navigate('/business');
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen font-sans text-slate-200 overflow-hidden">
            {/* Glassmorphic Hero Section */}
            <div className="relative pt-32 pb-24 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold mb-8 backdrop-blur-md"
                        >
                            <Cpu className="w-4 h-4 mr-2" />
                            The Brain: Neural Fulfillment
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]"
                        >
                            Autonomous <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Dispatch Logic.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                        >
                            Move beyond manual scheduling. Our AI-driven layer orchestrates your entire supply chain with zero-friction automation.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-video max-w-4xl mx-auto rounded-[2.5rem] border border-white/10 bg-slate-900/50 backdrop-blur-3xl p-8 shadow-2xl mb-16 group overflow-hidden"
                        >
                            {/* Infographic Simulation */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                            <div className="relative h-full flex flex-col items-center justify-center">
                                <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                                    {[
                                        { label: 'Demand Input', icon: Network, color: 'text-blue-400' },
                                        { label: 'Neural Processing', icon: Brain, color: 'text-brand-400' },
                                        { label: 'Autonomous Output', icon: Activity, color: 'text-brand-400' },
                                    ].map((step, i) => (step &&
                                        <div key={i} className="flex flex-col items-center">
                                            <div className={`w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 transition-all group-hover:bg-slate-700/50 ${step.color}`}>
                                                <step.icon className="w-10 h-10" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{step.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Connection Lines Animation */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200">
                                    <motion.path
                                        d="M130,100 L180,100"
                                        stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" fill="none"
                                        animate={{ strokeDashoffset: [-20, 0] }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    />
                                    <motion.path
                                        d="M220,100 L270,100"
                                        stroke="#22c55e" strokeWidth="2" strokeDasharray="4 4" fill="none"
                                        animate={{ strokeDashoffset: [-20, 0] }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
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
                                {isBusiness ? 'Go to Fulfillment Console' : 'Start Your Integration'}
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
                    <h2 className="text-white text-3xl md:text-4xl font-black mb-8">Engineering Logistics Elasticity.</h2>
                    <p className="text-xl md:text-2xl text-brand-50 leading-relaxed font-medium opacity-90">
                        Automating the complexity of the African logistics landscape. Our AI-driven adaptive fulfillment logic eliminates idle time, optimizes fuel efficiency, and ensures your network remains elastic under any conditions.
                    </p>
                </div>
            </div>

            {/* Detailed Features */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        {
                            icon: Zap,
                            title: "Smart Auto-Dispatch",
                            desc: "Our AI-powered proprietary engine handles routing and loading optimizations that are congestion-aware.",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10"
                        },
                        {
                            icon: BarChart3,
                            title: "Demand Orchestration",
                            desc: "Predict demand spikes across county lines and regionally. Allocate assets precisely to eliminate fleet idle time.",
                            color: "text-purple-400",
                            bg: "bg-purple-500/10"
                        },
                        {
                            icon: Globe,
                            title: "Autonomous Fulfillment",
                            desc: "Fully automated end-to-end fulfillment cycles, self-correcting for delays and ensuring performance.",
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

            {/* Bottom CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative border border-slate-700 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px]"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Ready to optimize your supply chain?</h2>
                        <p className="text-slate-400 text-xl mb-12 font-medium">
                            Join Kenya's most advanced logistics network and turn your delivery operations into a competitive advantage.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/business"
                                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all flex items-center justify-center shadow-lg"
                            >
                                Get Started Now
                            </Link>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-10 py-5 bg-transparent text-white border border-slate-600 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center"
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

export default AutonomousFulfillment;
