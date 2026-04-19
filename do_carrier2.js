const fs = require('fs');

const content = \import React from "react";
import { Bike, Truck, Globe, ArrowRight, Activity, BarChart3 } from "lucide-react";

const carriers = [
    {
        title: "Riders & Couriers",
        subtitle: "Boda-boda and bike delivery partners",
        description: "Turn your motorcycle into a steady income stream. Get matched with deliveries near you, earn daily, and receive instant M-Pesa payouts — no waiting, no middlemen.",
        perks: ["Instant M-Pesa payouts", "Daily order flow", "Performance bonuses"],
        icon: Bike,
        gradient: "from-emerald-400 to-green-500",
        accentText: "text-emerald-400",
        cta: "Start Earning",
    },
    {
        title: "Fleet Owners & Transport Partners",
        subtitle: "Commercial vehicles, vans, and trucks",
        description: "Maximize every vehicle in your fleet. Our AI dispatch fills your empty capacity, manages your drivers, and gives you real-time analytics to grow your business.",
        perks: ["AI-powered dispatch", "Fleet analytics dashboard", "Zero idle vehicles"],
        icon: Truck,
        gradient: "from-cyan-400 to-blue-500",
        accentText: "text-cyan-400",
        cta: "Join Network",
    },
    {
        title: "3PL & Cross-Border Partners",
        subtitle: "Enterprise logistics and regional fulfillment",
        description: "Plug into Kenya's fastest-growing delivery network via API. Fill backhaul capacity, access last-mile coverage nationwide, and streamline cross-border operations.",
        perks: ["RESTful API integration", "Nationwide last-mile reach", "Cross-border support"],
        icon: Globe,
        gradient: "from-violet-400 to-purple-500",
        accentText: "text-violet-400",
        cta: "Join Network",
    },
];

const CarrierNetworkSection: React.FC = () => {
    return (
        <div className="relative pt-10 pb-32 overflow-hidden pointer-events-auto bg-slate-950">
            {/* Background noise/grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-24 scroll-reveal anim-up">
                    <div className="inline-flex items-center justify-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em]">
                            Active Fulfillment Network
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Powering Kenya's <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">Logistics Engine</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                        Tap into a dynamic grid of moving capacity. From independent riders to enterprise fleets, we intelligently route demand to the optimal vehicle.
                    </p>
                </div>

                {/* Dynamic Flow Layout - NO CARDS */}
                <div className="relative max-w-5xl mx-auto">
                    
                    {/* Central Animated Line (Desktop only) */}
                    <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-white/10 -translate-x-1/2">
                        <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-[grid-move_3s_linear_infinite]" />
                    </div>

                    <div className="space-y-24 md:space-y-32 flex flex-col">
                        {carriers.map((carrier, idx) => {
                            const isEven = idx % 2 === 0;
                            const Icon = carrier.icon;
                            
                            return (
                                <div key={carrier.title} className={\elative flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16 scroll-reveal anim-up \\}>
                                    
                                    {/* Content Side */}
                                    <div className={\lex-1 w-full \ flex flex-col \\}>
                                        <div className={\inline-block mb-4 text-[10px] font-black uppercase tracking-widest \ bg-white/5 border border-white/10 px-4 py-2 rounded-full\}>
                                            {carrier.subtitle}
                                        </div>
                                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                            {carrier.title}
                                        </h3>
                                        <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-md">
                                            {carrier.description}
                                        </p>
                                        
                                        <div className="flex flex-col gap-4 mb-8 w-full md:w-auto">
                                            {carrier.perks.map(perk => (
                                                <div key={perk} className={\lex items-center gap-4 \\}>
                                                    <div className="w-2 h-2 rounded-full relative bg-white/20">
                                                        <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-75" style={{color: '#34d399'}} />
                                                    </div>
                                                    <span className="text-slate-300 font-medium text-lg">{perk}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button className={\group inline-flex items-center gap-3 font-bold text-xl hover:\ transition-colors \\}>
                                            <span className="underline decoration-2 underline-offset-8 decoration-transparent group-hover:decoration-current transition-all">
                                                {carrier.cta}
                                            </span>
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>

                                    {/* Icon/Node Center Column */}
                                    <div className="relative shrink-0 flex flex-col items-center justify-center">
                                        {/* Horizontal connection line to content on Desktop */}
                                        <div className={\hidden md:block absolute top-[52px] w-24 h-px bg-white/10 \\} />

                                        {/* Outer glowing ring matching background */}
                                        <div className="relative z-10 w-28 h-28 rounded-full border-2 border-white/5 bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center">
                                            {/* Floating Core */}
                                            <div className={\w-20 h-20 rounded-[2rem] bg-gradient-to-br \ flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-float\} style={{ animationDelay: \\s\ }}>
                                                <Icon className="w-10 h-10 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Empty flex space for balancing the layout on desktop */}
                                    <div className="hidden md:block flex-1" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA Area */}
                <div className="text-center mt-32 scroll-reveal anim-up">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button className="group relative px-10 py-5 bg-white hover:bg-gray-100 text-slate-950 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105">
                            <span className="relative z-10 text-emerald-600 font-black">START DRIVING WITH AXON</span>
                            <ArrowRight className="w-6 h-6 relative z-10 text-emerald-600 group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button className="px-10 py-5 bg-transparent hover:bg-white/5 text-white rounded-2xl font-bold text-lg transition-all border border-white/20 hover:border-white/40 flex items-center justify-center gap-3 hover:scale-105">
                            <BarChart3 className="w-6 h-6 text-slate-400" />
                            Earnings Calculator
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default CarrierNetworkSection;
\;

fs.writeFileSync('components/CarrierNetworkSection.tsx', content);
console.log('Replaced CarrierNetworkSection with vertical flowing timeline NO CARDS.');
