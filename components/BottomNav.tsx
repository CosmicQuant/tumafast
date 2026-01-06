import React from 'react';
import { Home, Clock, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
    onOpenMenu: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 pb-safe flex justify-between items-center z-[150] md:hidden">
            <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center space-y-1 p-2 ${isActive('/') ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
                onClick={() => navigate('/rides')}
                className={`flex flex-col items-center space-y-1 p-2 ${isActive('/rides') ? 'text-brand-600' : 'text-gray-400'}`}
            >
                <Clock className={`w-6 h-6 ${isActive('/rides') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold">Rides</span>
            </button>

            <button
                onClick={onOpenMenu}
                className="flex flex-col items-center space-y-1 p-2 text-gray-400 hover:text-gray-900"
            >
                <User className="w-6 h-6" />
                <span className="text-[10px] font-bold">Account</span>
            </button>
        </div>
    );
};

export default BottomNav;
