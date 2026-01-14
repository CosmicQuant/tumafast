
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
        <div className="bg-slate-50 min-h-screen pt-24 pb-24">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Column: Info */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            <Clock className="w-3 h-3" /> We respond in minutes
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8 leading-tight">
                            Let's Talk <br />
                            <span className="text-brand-600">Growth & Logistics.</span>
                        </h1>
                        <p className="text-lg text-gray-500 mb-12 font-medium leading-relaxed max-w-lg">
                            Whether you're looking to scale your e-commerce fleet or need a custom enterprise solution, our logistics experts are ready to help.
                        </p>

                        <div className="space-y-8 mb-16">
                            {[
                                { icon: Mail, title: 'Email Us', info: 'hello@tumafast.co.ke', sub: 'For general inquiries' },
                                { icon: Phone, title: 'Call Us', info: '+254 700 000 000', sub: 'Mon-Sun, 24/7 Support' },
                                { icon: MapPin, title: 'Our Office', info: 'Westlands, Nairobi', sub: 'The Delta Corner, Oracle Tower' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-600 border border-gray-100">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="font-black text-brand-600 text-lg tracking-tight">{item.info}</p>
                                        <p className="text-sm text-gray-400 font-medium">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                            <h4 className="text-xl font-black mb-4">Need immediate help?</h4>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Our AI assistant Kifaru is always online to help with tracking and quotes.</p>
                            <button
                                onClick={openChat}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl transition-all font-black uppercase tracking-widest text-xs"
                            >
                                <MessageCircle className="w-4 h-4" /> Start Live Chat
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                        <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Send a Message</h3>

                        {status === 'sent' ? (
                            <div className="py-20 text-center animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Send className="w-10 h-10" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 mb-2">Message Received!</h4>
                                <p className="text-gray-500 font-medium">We'll get back to you within 30 minutes.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-8 text-brand-600 font-black uppercase text-xs tracking-widest hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                        <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                                        <input required type="email" className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium" placeholder="john@company.com" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Company (Optional)</label>
                                    <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium" placeholder="TumaFast Ltd" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Inquiry Type</label>
                                    <select className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium">
                                        <option>Business Fleet Inquiry</option>
                                        <option>Partnership Proposal</option>
                                        <option>Press & Media</option>
                                        <option>Other Inquiry</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Your Message</label>
                                    <textarea required rows={5} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium resize-none" placeholder="Tell us how we can help..." />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-5 bg-slate-900 hover:bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl"
                                >
                                    {status === 'sending' ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Dispatching...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" /> Send Inquiry
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
