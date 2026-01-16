
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const ContactUs: React.FC = () => {
    const { openChat } = useChat();
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => setStatus('sent'), 1500);
    };

    return (
        <div className="bg-[#0f172a] min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    {/* Left Column: Info */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-bold tracking-wide mb-8 backdrop-blur-md">
                            <Clock className="w-4 h-4" /> Priority Enterprise Desk
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
                            Let's Talk <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">Growth & Logistics.</span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed max-w-lg">
                            Whether you're looking to scale your regional fleet or need a custom API infrastructure, our logistics engineers are ready to deploy.
                        </p>

                        <div className="space-y-10 mb-16">
                            {[
                                { icon: Mail, title: 'Global Inquiries', info: 'enterprise@tumafast.xyz', sub: 'For RFP & contract inquiries' },
                                { icon: Phone, title: 'Priority Sales', info: '+254 742 490 499', sub: 'Dedicated Enterprise Support' },
                                { icon: Globe, title: 'Regional Operations', info: '+254 711 775 856', sub: 'Pan-African Logistics Network' },
                                { icon: MapPin, title: 'Operations HQ', info: 'Nairobi, Kenya', sub: 'Global Response Station' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-start group">
                                    <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-brand-400 shadow-xl transition-all group-hover:scale-110 group-hover:bg-slate-700">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-400 mb-1 lowercase tracking-wide first-letter:uppercase">{item.title}</h4>
                                        <p className="font-black text-white text-xl tracking-tight leading-none mb-1">{item.info}</p>
                                        <p className="text-sm text-slate-500 font-medium italic">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
                            <h4 className="text-2xl font-black mb-4 relative z-10">Need technical help?</h4>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium relative z-10">Our AI assistant Kifaru is available to provide instant documentation lookups and status updates.</p>
                            <button
                                onClick={openChat}
                                className="flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-brand-900/40"
                            >
                                <MessageCircle className="w-5 h-5" /> Open Technical Chat
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-slate-800/40 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-3xl relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />

                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-white tracking-tight">System Inquiry</h3>
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                        </div>

                        {status === 'sent' ? (
                            <div className="py-24 text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <Send className="w-12 h-12" />
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4">Transmission Successful</h4>
                                <p className="text-slate-400 font-medium text-lg lg:px-12">Our deployment team will reach out to your organization within 30 minutes.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-white/10"
                                >
                                    Send another inquiry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Principal Name</label>
                                        <input required type="text" className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-brand-500 outline-none transition-all font-bold text-white placeholder:text-slate-500" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                                        <input required type="email" className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-brand-500 outline-none transition-all font-bold text-white placeholder:text-slate-500" placeholder="john@company.com" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Organization / Entity</label>
                                    <input type="text" className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-brand-500 outline-none transition-all font-bold text-white placeholder:text-slate-500" placeholder="Global Logistics Corp or Independent" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Inquiry Vector</label>
                                    <select className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-brand-500 outline-none transition-all font-bold text-white appearance-none cursor-pointer">
                                        <option className="bg-slate-900">Regional Fleet Integration</option>
                                        <option className="bg-slate-900">Personal / Individual Logistics</option>
                                        <option className="bg-slate-900">API Gateway Support</option>
                                        <option className="bg-slate-900">Industrial Settlement Solutions</option>
                                        <option className="bg-slate-900">General Partnership</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Project Scope</label>
                                    <textarea required rows={4} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-brand-500 outline-none transition-all font-bold text-white placeholder:text-slate-500 resize-none" placeholder="Describe your logistics requirements or personal needs..." />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-6 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-900/40 active:scale-[0.98]"
                                >
                                    {status === 'sending' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Establishing Connection...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" /> Initiate Deployment
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
