import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const FAQS = [
    {
        category: "Deliveries",
        questions: [
            { q: "How fast is TumaFast?", a: "Most in-city deliveries are completed within 45 to 90 minutes. For enterprise bulk orders, timelines depend on the volume and specific requirements." },
            { q: "Do you offer real-time tracking?", a: "Yes. Every order comes with a dynamic tracking link that shows the rider's exact GPS location, estimated time of arrival, and contact details." },
            { q: "What items can I send?", a: "We handle everything from documents and food to heavy furniture and industrial supplies. However, we do not transport illegal substances, hazardous materials, or unprotected fragile items without prior arrangement." }
        ]
    },
    {
        category: "Payments & Pricing",
        questions: [
            { q: "How is the delivery fee calculated?", a: "Pricing is based on the distance between pickup and dropoff, the vehicle type selected, and current demand. You will always see an upfront price before you confirm your order." },
            { q: "Which payment methods are accepted?", a: "We primarily use M-Pesa (STK Push) for instant settlement. Business partners with high volume can apply for monthly invoicing and credit terms." },
            { q: "Are there any hidden charges?", a: "No. The price you see at the point of booking is final. Waiting fees may apply if the rider is kept at a location for more than 10 minutes." }
        ]
    },
    {
        category: "Business & Security",
        questions: [
            { q: "Can I use TumaFast for my E-commerce store?", a: "Absolutely. We offer a robust API and a bulk upload feature specifically designed for high-growth e-commerce businesses." },
            { q: "What happens if a package is damaged?", a: "All TumaFast deliveries are covered by our standard Goods in Transit (GIT) insurance. If an item is damaged or lost, our claims team will handle the reimbursement process within 48 hours." },
            { q: "How are your drivers vetted?", a: "Every TumaFast partner goes through a rigorous vetting process involving criminal record checks, vehicle inspection, and training on professional handling." }
        ]
    }
];

const FAQPage: React.FC = () => {
    const { openChat } = useChat();
    const [openIndex, setOpenIndex] = useState<string | null>("Deliveries-0");
    const [searchQuery, setSearchQuery] = useState("");

    const toggleFaq = (category: string, index: number) => {
        const id = `${category}-${index}`;
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="bg-white min-h-screen pt-24 pb-24">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        <HelpCircle className="w-4 h-4" /> Support Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Frequently Asked <span className="text-brand-600">Questions</span></h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Everything you need to know about TumaFast's AI-driven logistics network.</p>
                </div>

                {/* Search */}
                <div className="relative mb-16">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for answers (e.g. 'insurance', 'M-Pesa')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* FAQ Content */}
                <div className="space-y-12">
                    {FAQS.map((category) => (
                        <div key={category.category}>
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                                <span className="h-[2px] w-8 bg-brand-500 mr-3"></span> {category.category}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((faq, idx) => {
                                    const id = `${category.category}-${idx}`;
                                    const isOpen = openIndex === id;

                                    // Simple filter logic
                                    if (searchQuery && !faq.q.toLowerCase().includes(searchQuery.toLowerCase()) && !faq.a.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                                    return (
                                        <div key={idx} className={`border rounded-[2rem] transition-all duration-300 overflow-hidden ${isOpen ? 'border-brand-100 bg-brand-50/20 ring-1 ring-brand-100' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'}`}>
                                            <button
                                                onClick={() => toggleFaq(category.category, idx)}
                                                className="w-full flex items-center justify-between p-8 text-left outline-none"
                                            >
                                                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-brand-700' : 'text-slate-900'}`}>{faq.q}</span>
                                                {isOpen ? <ChevronUp className="w-5 h-5 text-brand-600" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
                                            </button>
                                            {isOpen && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-2 duration-300">
                                                    <p className="text-gray-600 leading-relaxed font-medium">{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Card */}
                <div className="mt-24 p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black mb-2 tracking-tight">Still have questions?</h3>
                        <p className="text-gray-400 font-medium">Our support team is active 24/7 to help you move.</p>
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center">
                        <button
                            onClick={openChat}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            <MessageCircle className="w-4 h-4" /> Live Chat
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]">
                            <Mail className="w-4 h-4" /> Email Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
