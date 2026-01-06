import React from 'react';
import { motion } from 'framer-motion';
import { Bike, Car, Truck, Navigation } from 'lucide-react';

export const HeroBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)' }}>
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.08]" style={{
                backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                backgroundSize: '80px 80px'
            }}></div>

            {/* Animated Traffic */}
            <div className="absolute inset-0">
                {/* Horizontal Traffic - Right */}
                <motion.div
                    className="absolute top-[15%] text-brand-500/30 flex items-center justify-center"
                    initial={{ left: '-10%', opacity: 0 }}
                    animate={{ left: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                >
                    <Bike size={30} />
                </motion.div>

                <motion.div
                    className="absolute top-[40%] text-green-500/30 flex items-center justify-center"
                    initial={{ left: '-10%', opacity: 0 }}
                    animate={{ left: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 7 }}
                >
                    <Car size={40} />
                </motion.div>

                <motion.div
                    className="absolute top-[65%] text-brand-600/30 flex items-center justify-center"
                    initial={{ left: '-10%', opacity: 0 }}
                    animate={{ left: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 3 }}
                >
                    <Truck size={50} />
                </motion.div>

                {/* Horizontal Traffic - Left */}
                <motion.div
                    className="absolute top-[25%] text-brand-400/30 flex items-center justify-center"
                    initial={{ right: '-10%', opacity: 0 }}
                    animate={{ right: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear', delay: 5 }}
                >
                    <Car size={35} className="scale-x-[-1]" />
                </motion.div>

                <motion.div
                    className="absolute top-[55%] text-green-400/30 flex items-center justify-center"
                    initial={{ right: '-10%', opacity: 0 }}
                    animate={{ right: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear', delay: 12 }}
                >
                    <Bike size={25} className="scale-x-[-1]" />
                </motion.div>

                {/* Vertical Traffic - Down */}
                <motion.div
                    className="absolute left-[10%] text-brand-400/30 flex items-center justify-center"
                    initial={{ top: '-10%', opacity: 0 }}
                    animate={{ top: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear', delay: 2 }}
                >
                    <Navigation size={30} className="rotate-180" />
                </motion.div>

                <motion.div
                    className="absolute left-[45%] text-green-400/30 flex items-center justify-center"
                    initial={{ top: '-10%', opacity: 0 }}
                    animate={{ top: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 32, repeat: Infinity, ease: 'linear', delay: 10 }}
                >
                    <Navigation size={25} className="rotate-180" />
                </motion.div>

                <motion.div
                    className="absolute left-[80%] text-brand-500/30 flex items-center justify-center"
                    initial={{ top: '-10%', opacity: 0 }}
                    animate={{ top: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 45, repeat: Infinity, ease: 'linear', delay: 6 }}
                >
                    <Navigation size={35} className="rotate-180" />
                </motion.div>

                {/* Vertical Traffic - Up */}
                <motion.div
                    className="absolute left-[25%] text-brand-300/30 flex items-center justify-center"
                    initial={{ bottom: '-10%', opacity: 0 }}
                    animate={{ bottom: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 38, repeat: Infinity, ease: 'linear', delay: 4 }}
                >
                    <Navigation size={28} />
                </motion.div>

                <motion.div
                    className="absolute left-[65%] text-green-300/30 flex items-center justify-center"
                    initial={{ bottom: '-10%', opacity: 0 }}
                    animate={{ bottom: '110%', opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 42, repeat: Infinity, ease: 'linear', delay: 15 }}
                >
                    <Navigation size={22} />
                </motion.div>

                {/* Pulsing Glows */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-[120px]"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[150px]"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                />
            </div>
        </div>
    );
};
