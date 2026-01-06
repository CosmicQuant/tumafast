import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HistoryList from './HistoryList';
import {
    Package, Settings, LogOut, ArrowLeft, Plus, Search,
    Copy, Clock, MapPin, ChevronRight, User, Truck,
    ExternalLink, Calendar, CreditCard, Box, Shield,
    Navigation, CheckCircle2, AlertCircle, LayoutDashboard,
    Bell, Lock, Eye, Trash2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CustomerDashboard: React.FC = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [currentView, setCurrentView] = useState<'DELIVERIES' | 'SETTINGS'>('DELIVERIES');
    const [trackingInput, setTrackingInput] = useState('');

    // Settings States
    const [isSaving, setIsSaving] = useState(false);
    const [personalInfo, setPersonalInfo] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        idNumber: user?.idNumber || ''
    });

    useEffect(() => {
        if (user) {
            setPersonalInfo({
                name: user.name || '',
                phone: user.phone || '',
                idNumber: user.idNumber || ''
            });
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleTrack = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (trackingInput.trim()) {
            navigate(`/track?id=${trackingInput.trim()}`);
        } else {
            toast.error("Please enter a tracking ID");
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateUser(personalInfo);
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Order ID copied!");
    };

    return (
        <div className="min-h-screen bg-[#FBFCFE] p-4 sm:p-8 lg:p-12 font-sans pt-24">
            <div className="max-w-7xl mx-auto">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hello, {user?.name?.split(' ')[0] || 'User'}</h1>
                            <p className="text-gray-500 font-medium">Manage your deliveries and account</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/book')}
                        className="bg-[#22C55E] hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95 text-sm uppercase tracking-wider"
                    >
                        <Plus className="w-5 h-5" /> NEW ORDER
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#F8FAFC]">
                                <span className="text-2xl font-black text-gray-400">
                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </span>
                            </div>
                            <h3 className="font-black text-slate-900 text-lg leading-tight truncate px-2">{user?.name}</h3>
                            <p className="text-gray-400 text-xs mt-1 truncate px-4">{user?.email}</p>

                            <hr className="my-6 border-gray-50" />

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setCurrentView('DELIVERIES')}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${currentView === 'DELIVERIES' ? 'bg-[#22C55E] text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Package className="w-5 h-5" />
                                    My Deliveries
                                </button>
                                <button
                                    onClick={() => setCurrentView('SETTINGS')}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${currentView === 'SETTINGS' ? 'bg-[#22C55E] text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Settings className="w-5 h-5" />
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all mt-4"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-10">
                        {currentView === 'DELIVERIES' ? (
                            <>
                                {/* Tracking Card */}
                                <div className="bg-[#F0FDF4] p-8 rounded-[2.5rem] border border-[#DCFCE7] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 text-[#22C55E15]">
                                        <Search className="w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="relative z-10 max-w-xl">
                                        <h2 className="text-2xl font-black text-slate-900 mb-2">Track a Package</h2>
                                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                            Have a tracking number? Enter it here to see the real-time status and location of your delivery.
                                        </p>
                                        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-grow">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter Order ID..."
                                                    value={trackingInput}
                                                    onChange={(e) => setTrackingInput(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-[#22C55E] rounded-2xl font-bold text-slate-900 shadow-sm transition-all focus:ring-0 outline-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-[#22C55E] hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-100 transition-all active:scale-95"
                                            >
                                                Track Now
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Order History */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden p-6 sm:p-10">
                                        <HistoryList
                                            onTrackOrder={(id) => navigate(`/track/${id}`)}
                                            onReorder={(prefill) => navigate('/book', { state: { prefill } })}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Settings View matching Dashboard Style */
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 animate-in fade-in duration-500">
                                <h2 className="text-2xl font-black text-slate-900 mb-8">Account Settings</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-50">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
                                            <input
                                                type="text"
                                                value={personalInfo.name}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#22C55E] focus:bg-white transition-all font-bold text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
                                            <input
                                                type="tel"
                                                value={personalInfo.phone}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#22C55E] focus:bg-white transition-all font-bold text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email <span className="text-[10px] text-gray-300">(Read-only)</span></label>
                                        <div className="relative group opacity-60 cursor-not-allowed">
                                            <Bell className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                disabled
                                                value={user?.email || ''}
                                                className="w-full pl-14 pr-6 py-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-500 outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">National ID</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
                                            <input
                                                type="text"
                                                value={personalInfo.idNumber}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, idNumber: e.target.value })}
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#22C55E] focus:bg-white transition-all font-bold text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setCurrentView('DELIVERIES')}
                                        className="px-8 py-4 text-sm font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="bg-[#22C55E] hover:bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-green-100 transition-all active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {isSaving ? 'UPDATING...' : 'SAVE CHANGES'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
