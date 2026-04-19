const fs = require('fs');

let content = fs.readFileSync('components/CarrierNetworkSection.tsx', 'utf8');

const newComponent = \import React, { useState } from "react";
import { Bike, Truck, Globe, ArrowRight, Users, BarChart3, Smartphone, Activity } from "lucide-react";

const carriers = [
    {
        title: "Riders & Couriers",
        subtitle: "Boda-boda and bike delivery partners",
        description: "Turn your motorcycle into a steady income stream. Get matched with deliveries near you, earn daily, and receive instant M-Pesa payouts — no waiting, no middlemen.",
        perks: ["Instant M-Pesa payouts", "Daily order flow", "Performance bonuses"],
        icon: Bike,
        gradient: "from-emerald-400 to-green-500",
        accentBorder: "border-emerald-500/30",
        accentText: "text-emerald-400",
        accentBg: "bg-emerald-500/10",
        cta: "Start Earning",
        animationDelay: "0s",
        animationDuration: "15s"
    },
    {
        title: "Fleet Owners & Transport Partners",
        subtitle: "Commercial vehicles, vans, and trucks",
        description: "Maximize every vehicle in your fleet. Our AI dispatch fills your empty capacity, manages your drivers, and gives you real-time analytics to grow your business.",
        perks: ["AI-powered dispatch", "Fleet analytics dashboard", "Zero idle vehicles"],
        icon: Truck,
        gradient: "from-cyan-400 to-blue-500",
        accentBorder: "border-cyan-500/30",
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-500/10",
        cta: "Join Network",
        animationDelay: "2s",
        animationDuration: "20s"
    },
    {
        title: "3PL & Cross-Border Partners",
        subtitle: "Enterprise logistics and regional fulfillment",
        description: "Plug into Kenya\\'s fastest-growing delivery network via API. Fill backhaul capacity, access last-mile coverage nationwide, and streamline cross-border operations.",
        perks: ["RESTful API integration", "Nationwide last-mile reach", "Cross-border support"],
        icon: Globe,
        gradient: "from-violet-400 to-purple-500",
        accentBorder: "border-violet-500/30",
        accentText: "text-violet-400",
        accentBg: "bg-violet-500/10",
        cta: "Join Network",
        animationDelay: "5s",
        animationDuration: "25s"
    },
];

const CarrierNetworkSection: React.FC = () => {
    return (
        <div className="relative py-24 overflow-hidden pointer-events-auto bg-slate-950" style={{ marginTop: "-1px" }}>
            <style>{\
                @keyframes vehicle-drive {
                    0% { transform: translateX(-100px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(calc(100vw + 100px)); opacity: 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
            \}</style>
            
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl opacity-50" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-10 w-full overflow-visible">
                {/* Header */}
                <div className="text-center mb-20 scroll-reveal anim-scale">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                            Active Fulfillment Network
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
                        Powering Kenya\\'s{" "}
                        <span className="text-transparent bg-clip-text inline-block" style={{ backgroundImage: "linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", paddingBottom: "0.1em" }}>
                            Logistics Engine
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Tap into a dynamic grid of moving capacity. From independent boda riders to cross-border truck fleets, our platform automatically routes demand to the optimal vehicle in real-time.
                    </p>
                </div>

                {/* Animated Lanes */}
                <div className="flex flex-col gap-12 w-full">
                    {carriers.map((carrier, idx) => {
                        const Icon = carrier.icon;
                        return (
                            <div key={carrier.title} className="relative w-full group scroll-reveal anim-up" style={{ animationDelay: \\s\ }}>
                                
                                {/* Track Line extending full width implicitly via overflow-visible on container 
                                    Using an absolute line behind the box
                                */}
                                <div className="absolute inset-x-[-50vw] top-12 h-px bg-white/5 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)] border-b border-black/20" />
                                
                                {/* Animated Vehicle moving along the track */}
                                <div 
                                    className="absolute top-8 z-0 flex items-center justify-center pointer-events-none"
                                    style={{
                                        left: 0,
                                        animation: \ehicle-drive \ linear infinite \\
                                    }}
                                >
                                    <div className={\w-10 h-10 rounded-full bg-gradient-to-br \ flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]\}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    {/* Trail effect */}
                                    <div className={\h-[2px] w-24 bg-gradient-to-r \ scale-opacity opacity-50 blur-sm -ml-2 rounded-full\} style={{ right: '100%', position: 'absolute' }} />
                                </div>

                                {/* Content Card sitting OVER the track */}
                                <div className={\elative z-10 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-slate-900/80 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]\}>
                                    
                                    {/* Glowing aura inside card */}
                                    <div className={\bsolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br \ rounded-full blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity duration-700\} />

                                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={\w-16 h-16 rounded-2xl bg-white/[0.03] border \ flex items-center justify-center \ group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500\}>
                                                    <Icon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <div className={\	ext-xs font-bold uppercase tracking-widest \ mb-1 opacity-80\}>
                                                        {carrier.subtitle}
                                                    </div>
                                                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                                                        {carrier.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                                                {carrier.description}
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-6">
                                            <div className="space-y-3">
                                                {carrier.perks.map((perk) => (
                                                    <div key={perk} className="flex items-center gap-3">
                                                        <div className={\w-6 h-6 rounded-full \ flex items-center justify-center flex-shrink-0\}>
                                                            <div className={\w-2 h-2 rounded-full bg-gradient-to-br \\} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-300">{perk}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <button className={\inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300 group/btn\}>
                                                {carrier.cta}
                                                <ArrowRight className={\w-4 h-4 \ md:group-hover/btn:translate-x-1 transition-transform\} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-24 scroll-reveal anim-up delay-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="group px-8 py-4 bg-white text-slate-900 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all shadow-lg inline-flex items-center gap-2">
                            Join the Network
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-emerald-600" />
                        </button>
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all backdrop-blur-sm border border-white/15 hover:border-white/30 inline-flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            See Earnings Calculator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarrierNetworkSection;
\;

fs.writeFileSync('components/CarrierNetworkSection.tsx', newComponent);
console.log('Replaced CarrierNetworkSection');
