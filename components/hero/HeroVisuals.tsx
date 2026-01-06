import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Smartphone, CheckCircle2, Star, ChevronRight } from 'lucide-react';

export const HeroVisuals: React.FC = () => {
    return (
        <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center relative">
            {/* Glow Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-gradient-to-tr from-brand-100 to-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {/* Phone Frame */}
            <motion.div
                className="relative z-10 mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[3rem] h-[600px] w-[320px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >

                {/* Notch & Top Bar */}
                <div className="absolute top-0 w-full h-8 bg-white z-30 flex justify-center">
                    <div className="h-6 w-40 bg-gray-900 rounded-b-2xl"></div>
                </div>

                {/* Screen Content */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
                    {/* Simulated Map */}
                    <div className="absolute inset-0 z-0 bg-slate-100">
                        <svg className="absolute inset-0 w-full h-full text-slate-300">
                            <path d="M120 -50 L140 800" stroke="currentColor" strokeWidth="8" fill="none" />
                            <path d="M-50 180 L400 150" stroke="currentColor" strokeWidth="8" fill="none" />
                            <path d="M-50 100 L400 80" stroke="currentColor" strokeWidth="3" fill="none" />
                            <path d="M200 -50 L220 800" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path d="M-50 350 L400 320" stroke="currentColor" strokeWidth="3" fill="none" />
                            <path d="M300 -50 L320 800" stroke="currentColor" strokeWidth="3" fill="none" />
                            <path d="M-50 480 L400 460" stroke="currentColor" strokeWidth="3" fill="none" />
                            <path d="M40 -50 L60 800" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M260 -50 L280 800" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M-50 280 L400 250" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M280 400 Q 350 450 400 420 L 400 600 L 250 600 Z" className="text-blue-100" fill="currentColor" stroke="none" />
                        </svg>
                    </div>

                    {/* Map Overlay Elements */}
                    <div className="absolute inset-0 z-10">
                        {/* Route Line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80 filter drop-shadow-md">
                            <motion.path
                                d="M80 420 C 80 350, 150 350, 180 250 S 240 180, 240 140"
                                stroke="#3b82f6"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="6 4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                            />
                        </svg>

                        {/* Location Dot */}
                        <div className="absolute top-[420px] left-[80px] -translate-x-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                        </div>

                        {/* Moving Vehicle */}
                        <motion.div
                            className="absolute"
                            animate={{
                                top: ['420px', '250px', '140px'],
                                left: ['80px', '180px', '240px']
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="w-10 h-10 bg-brand-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-20 relative -translate-x-1/2 -translate-y-1/2">
                                <Truck className="w-5 h-5 text-white" />
                            </div>
                            <div className="w-10 h-10 bg-black/20 rounded-full absolute -bottom-1 -left-5 blur-sm transform scale-x-150"></div>
                        </motion.div>
                    </div>

                    {/* Top Status Bar */}
                    <div className="relative z-20 pt-10 px-4">
                        <div className="flex justify-between items-center">
                            <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
                                <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
                            </div>
                            <motion.div
                                className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                En Route • 12 mins
                            </motion.div>
                            <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
                                <Smartphone className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    {/* Floating Notification */}
                    <motion.div
                        className="absolute top-[20%] left-4 right-4 z-20"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-900">Driver Arriving</div>
                                <div className="text-[10px] text-gray-500">John is 2km away with your package</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom Driver Card */}
                    <div className="mt-auto bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] p-5 z-20 relative">
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="Driver" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-gray-900 text-sm">John Doe</h4>
                                    <div className="flex items-center text-xs font-bold text-gray-900">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" /> 4.9
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Black Motorcycle • KMD 45X</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-brand-600 text-white text-xs font-bold py-3 rounded-xl shadow-brand-200 hover:bg-brand-700 transition-colors">
                                Call Driver
                            </button>
                            <button className="flex-1 bg-gray-50 text-gray-700 text-xs font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
