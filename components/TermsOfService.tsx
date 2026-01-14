import React from 'react';
import { LayoutDashboard, ArrowLeft, Shield, Scale, Info, CheckCircle2, AlertTriangle, Scale as Balance, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FBFCFE] font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-slate-900 transition-colors" />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Service Terms</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-12">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-10 sm:p-16">
                        <div className="flex items-center gap-2 text-blue-600 mb-6 font-black uppercase text-xs tracking-widest">
                            <Scale className="w-4 h-4" />
                            Agreement Version 2.4
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">Tumafast Kenya Service Agreement</h2>

                        <div className="space-y-10">
                            {/* Summary Box */}
                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
                                    <Info className="w-4 h-4" /> Simple Summary
                                </h3>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    By using Tumafast, you agree to follow the rules of our logistics network. We provide the technology to connect you with delivery partners. You are responsible for ensuring the items you ship are legal and as described.
                                </p>
                            </div>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-4">1. Acceptance of Terms</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    By accessing or using the Tumafast platform, you agree to be bound by these Terms. If you do not agree to all of these terms, do not use the service.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-4">2. User Accounts</h3>
                                <div className="space-y-3 text-gray-600 leading-relaxed pl-4">
                                    <p>• You must provide accurate and complete information when creating an account.</p>
                                    <p>• You are responsible for maintaining the confidentiality of your account password.</p>
                                    <p>• You may deactivate your account at any time, but outstanding balances remain payable.</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-4">3. Prohibited Goods</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    You represent and warrant that you will not use the Service to transport any prohibited items, including but not limited to:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl font-bold">
                                        <AlertTriangle className="w-4 h-4" /> Hazardous Materials
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl font-bold">
                                        <AlertTriangle className="w-4 h-4" /> Illegal Substances
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl font-bold">
                                        <AlertTriangle className="w-4 h-4" /> Firearms/Ammunition
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl font-bold">
                                        <AlertTriangle className="w-4 h-4" /> Unregistered Medical Supplies
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-4">4. Payment & Pricing</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Prices are calculated based on distance, vehicle type, and demand. Payment is due at the time of booking or upon delivery as specified in the checkout process. All payments are processed in Kenyan Shillings (KES).
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-4">5. Limitation of Liability</h3>
                                <p className="text-gray-600 leading-relaxed italic">
                                    Tumafast's liability for lost or damaged goods is capped at KES 50,000 per shipment unless additional insurance is purchased at the time of booking. We are not liable for delays caused by traffic, weather, or government actions.
                                </p>
                            </section>
                        </div>

                        <div className="mt-20 pt-10 border-t border-gray-50 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Balance className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-400 font-bold">Governing Law: Laws of the Republic of Kenya</span>
                            </div>
                            <button
                                onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                            >
                                I Understand and Accept
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;