import React from 'react';
import { LayoutDashboard, ArrowLeft, Shield, Lock, Eye, FileText, Globe, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Confidential</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-12">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-10 sm:p-16">
                        <div className="flex items-center gap-2 text-emerald-600 mb-6">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Last Updated: January 14, 2026</span>
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">Your privacy is our priority.</h2>

                        <p className="text-gray-500 text-lg leading-relaxed mb-10">
                            At Tumafast Kenya, we follow a simple principle: your data belongs to you. We only collect what is strictly necessary to provide our logistics services and ensure your deliveries are safe.
                        </p>

                        <div className="space-y-12">
                            <section>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">What we collect</h3>
                                </div>
                                <div className="space-y-4 text-gray-600 leading-relaxed pl-14">
                                    <p>• <span className="font-bold text-slate-800">Identity:</span> Name, email, and phone number to create your account.</p>
                                    <p>• <span className="font-bold text-slate-800">Location:</span> Real-time GPS data for pickup and delivery tracking.</p>
                                    <p>• <span className="font-bold text-slate-800">Transactions:</span> Payment history and order details for your records.</p>
                                    <p>• <span className="font-bold text-slate-800">Device Info:</span> IP address and app version to help us fix bugs and prevent fraud.</p>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                        < Globe className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">How we use it</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed pl-14">
                                    We use your data primarily to connect you with drivers, calculate routes, and process payments. We also use aggregated, non-identifiable data to improve our logistics algorithms across Kenya. We <span className="font-bold text-slate-900 italic">never</span> sell your personal data to advertisers.
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">Data Security</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed pl-14">
                                    All personal data is encrypted in transit using industry-standard TLS encryption. Your payment info is handled by PCI-compliant processed like M-Pesa or Stripe; Tumafast never stores your full credit card or PIN numbers.
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">Your Rights</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-14">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h4 className="font-bold text-slate-900 mb-1">Access & Export</h4>
                                        <p className="text-xs text-gray-500">You can download a full copy of your data any time from settings.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h4 className="font-bold text-slate-900 mb-1">Right to Erasure</h4>
                                        <p className="text-xs text-gray-500">Deleting your account permanently removes all personal identifiers.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="mt-20 pt-10 border-t border-gray-50 text-center">
                            <p className="text-sm text-gray-400">Questions about our privacy practices?</p>
                            <a href="mailto:privacy@tumafast.co.ke" className="text-emerald-600 font-black uppercase text-xs tracking-widest mt-2 block hover:underline">
                                Contact Privacy Team
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;