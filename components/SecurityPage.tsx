import React from 'react';
import { Shield, Lock, Eye, CheckCircle, Smartphone, Server, FileCheck, Key, CreditCard, UserCheck, Bug, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SecurityPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-white min-h-screen pt-24 pb-24">
            <div className="max-w-5xl mx-auto px-4">
                {/* Minimal Header */}
                <div className="mb-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        <Lock className="w-4 h-4" /> Trusted & Secure
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">Built for <span className="text-brand-600">Confidentiality.</span></h1>
                    <p className="text-lg text-gray-500 max-w-2xl font-medium leading-relaxed">Security is not a feature at TumaFast—it's the bedrock. We protect your data, your earnings, and your goods with institutional-grade protocols.</p>
                </div>

                {/* Security Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {[
                        { title: 'End-to-End Encryption', desc: 'All delivery data and business communications are encrypted using AES-256 standard.', icon: Shield },
                        { title: 'Payment Integrity', desc: 'Direct M-Pesa integration with multi-step verification to ensure funds only move when you intend them to.', icon: CreditCard },
                        { title: 'Vetted Partners', desc: 'Every carrier is biometrically verified and undergoes continuous background monitoring.', icon: UserCheck },
                        { title: 'Real-time Auditing', desc: 'Continuous monitoring of all active shipments with automated anomaly detection.', icon: Eye },
                        { title: 'Infrastructure Resilience', desc: 'Cloud-native architecture with 99.99% uptime and geographically redundant backups.', icon: Server },
                        { title: 'Access Control', desc: 'Role-based access controls and mandatory two-factor authentication for sensitive accounts.', icon: Key }
                    ].map((item, idx) => (
                        <div key={idx} className="p-8 border border-gray-100 rounded-[2.5rem] bg-slate-50/30 hover:bg-white hover:border-brand-200 hover:shadow-xl transition-all group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Verification Process Section */}
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden mb-24">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full blur-[120px] opacity-10 -mr-40 -mt-40" />

                    <h2 className="text-3xl font-black mb-12 tracking-tight">Our Security Lifecycle</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-10">
                            {[
                                { step: '01', title: 'Carrier Onboarding', desc: 'Physical inspection of vehicles, valid documentation check, and facial recognition mapping.' },
                                { step: '02', title: 'Data Transmission', desc: 'All requests use TLS 1.3 to ensure that the route and item details remain private between sender and carrier.' },
                                { step: '03', title: 'Digital Handover', desc: 'Deliveries use unique QR-code or PIN-based confirmation to guarantee the right person receives the goods.' }
                            ].map((s, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <span className="text-2xl font-black text-brand-500 opacity-50">{s.step}</span>
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">{s.title}</h4>
                                        <p className="text-gray-400 text-sm font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex items-center justify-center border-dashed">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
                                    <FileCheck className="w-8 h-8 text-brand-500" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-widest text-brand-500 mb-2">ISO 27001 Compliant</p>
                                <p className="text-gray-500 text-xs font-medium">Internal standards adhere to global <br /> best practices for info security.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimal Footer CTA */}
                <div className="text-center py-20 border-t border-gray-100">
                    <div className="max-w-xl mx-auto">
                        <Bug className="w-12 h-12 text-brand-600 mx-auto mb-6 opacity-30" />
                        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Vulnerability Disclosure</h3>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed">We believe in continuous improvement. If you've found a security flaw, our engineering team is ready to analyze your report and fix it immediately.</p>
                        <button
                            onClick={() => navigate('/report-vulnerability')}
                            className="px-8 py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 mx-auto"
                        >
                            <Shield className="w-5 h-5" /> Report Vulnerability <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
