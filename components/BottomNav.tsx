import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Plus, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'history', label: 'Orders', icon: Package, path: user?.role === 'driver' ? '/driver' : '/customer-dashboard' },
        { id: 'book', label: 'Book', icon: Plus, path: '/book', isAction: true },
        { id: 'track', label: 'Track', icon: MapPin, path: '/track' },
        { id: 'profile', label: 'Profile', icon: User, path: isAuthenticated ? (user?.role === 'driver' ? '/driver' : '/customer-dashboard') : '/login' },
    ];

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="md:hidden fixed bottom-1 rounded-t-3xl left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-[100] safe-area-pb"
        >
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    if (item.isAction) {
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(item.path)}
                                className="relative -top-5 w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/40"
                            >
                                <item.icon className="w-6 h-6" />
                            </motion.button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full text-xs font-bold transition-all ${active ? 'text-brand-600 border-t-2 border-brand-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${active ? 'fill-brand-600/10' : ''}`} />
                            <span className="tracking-tighter uppercase text-[8px]">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default BottomNav;
