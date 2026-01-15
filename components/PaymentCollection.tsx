import React from 'react';
import { CreditCard, Wallet, ArrowRight, CheckCircle2, ShieldCheck, Zap, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const PaymentCollection = () => {
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
                        <CreditCard className="w-4 h-4 mr-2" />
                        Smart Liquidity Layer
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                        Payments Collection: <span className="text-brand-600">Secure & Instant</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8 font-medium">
                        We collect payments for your deliveries and make instant settlements for the goods delivered. Secure, cash-lite, and zero-friction commercial movement.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            to="/business"
                            className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/10 flex items-center justify-center group"
                        >
                            Explore Business Solutions
                            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 h-full flex flex-col">
                        <div className="w-12 h-12 bg-brand-50 flex items-center justify-center rounded-xl text-brand-600 mb-6">
                            <HandCoins className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Cash-on-Delivery (COD)</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Automated mobile money collection at the point of delivery. Eliminate the risks of physical cash handling for your mobile teams.
                        </p>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 h-full flex flex-col">
                        <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600 mb-6">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Instant Settlement</h3>
                        <p className="text-slate-600 leading-relaxed">
                            No more 7-day cycles. Once the good is delivered and payment collected, the settlement to your business account happens instantly.
                        </p>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 h-full flex flex-col">
                        <div className="w-12 h-12 bg-indigo-50 flex items-center justify-center rounded-xl text-indigo-600 mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Secure Escrow</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Payments are held in a secure infrastructure until fulfillment criteria are met, protecting both the buyer and the enterprise.
                        </p>
                    </div>
                </div>
            </div>

            {/* How it Works / Trust */}
            <div className="bg-slate-50 border-y border-slate-200 mt-32 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">Bridging the Commercial <br /> Liquidity Gap</h2>
                            <p className="text-slate-600 text-lg mb-8">
                                In a market built on trust, TumaFast provides the technical middle-ground that allows trade to happen faster. We handle the collection so you can focus on the product.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "M-Pesa Integrated Native flow",
                                    "Zero Cash Handling for Couriers",
                                    "Immutable Digital Receipts",
                                    "Automated Commercial Settlement"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-900 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-brand-500" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-brand-50 rounded-2xl border border-brand-100">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="w-5 h-5 text-brand-600" />
                                        <span className="font-bold">Total Collected</span>
                                    </div>
                                    <span className="font-black text-brand-700">KES 142,500</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Transactions</p>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-slate-600">DELIVERY #{482 + i}</span>
                                            <span className="font-bold text-brand-600">+ KES 2,400</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
                <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                    <h2 className="text-3xl font-black mb-6 relative z-10">Stop chasing payments. <br /> Start fulfilling orders.</h2>
                    <button
                        onClick={() => navigate('/business')}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-brand-900/40 relative z-10"
                    >
                        Partner With TumaFast
                    </button>
                    {/* Visual accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCollection;
