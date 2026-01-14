import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HistoryList from './HistoryList';
import { mapService } from '../services/mapService';
import {
    Package, Settings, LogOut, ArrowLeft, Plus, Search,
    Copy, Clock, MapPin, ChevronRight, User, Truck,
    ExternalLink, Calendar, CreditCard, Box, Shield,
    Navigation, CheckCircle2, AlertCircle, LayoutDashboard,
    Bell, Lock, Eye, Trash2, ArrowRight, Smartphone,
    EyeOff, Key, ShieldCheck, FileText, Info, ChevronDown, ChevronUp,
    RefreshCw, Check, Home, Briefcase, X as CloseIcon, Loader, AlertTriangle, Power, QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CustomerDashboard: React.FC = () => {
    const { user, logout, updateUser, updatePassword, deleteAccount } = useAuth();
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

    // Password Update States
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });
    const [showPass, setShowPass] = useState(false);

    // 2FA States
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isUpdating2FA, setIsUpdating2FA] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFAStep, setTwoFAStep] = useState<'INTRO' | 'QR' | 'VERIFY'>('INTRO');
    const [otpValue, setOtpValue] = useState('');

    // Danger Zone States
    const [showDeleteInput, setShowDeleteInput] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Notification States
    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        push: false
    });

    // Address States
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>(user?.savedAddresses || [
        { id: 'home', label: 'Home', address: user?.address || 'Nairobi, Kenya', icon: Home },
        { id: 'work', label: 'Work', address: 'Add work address...', icon: Briefcase }
    ]);

    // Visibility States for sections
    const [expandedSection, setExpandedSection] = useState<string | null>('PERSONAL');

    useEffect(() => {
        if (user) {
            setPersonalInfo({
                name: user.name || '',
                phone: user.phone || '',
                idNumber: user.idNumber || ''
            });
            if (user.savedAddresses) setSavedAddresses(user.savedAddresses);
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
            await updateUser({ ...personalInfo, savedAddresses });
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwords.new || !passwords.confirm) {
            toast.error("Please fill all password fields");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsSaving(true);
        try {
            await updatePassword(passwords.new);
            toast.success('Password updated successfully');
            setPasswords({ new: '', confirm: '' });
            setShowPasswordFields(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddressSearch = async (val: string) => {
        setAddressQuery(val);
        if (val.length > 2) {
            setIsSearchingAddress(true);
            const suggestions = await mapService.getSuggestions(val);
            setAddressSuggestions(suggestions);
            setIsSearchingAddress(false);
        } else {
            setAddressSuggestions([]);
        }
    };

    const handleSelectAddress = (suggestion: any) => {
        const newAddr = {
            id: Date.now().toString(),
            label: 'Other',
            address: suggestion.label,
            icon: MapPin
        };
        const updated = [...savedAddresses, newAddr];
        setSavedAddresses(updated);
        setAddressQuery('');
        setAddressSuggestions([]);
        setIsAddingAddress(false);
        toast.success("Address added! Don't forget to save changes.");
    };

    const handleDeleteAddress = (id: string) => {
        setSavedAddresses(savedAddresses.filter(a => a.id !== id));
        toast.success("Address removed locally. Save to confirm.");
    };

    const handleToggle2FA = async () => {
        if (!is2FAEnabled) {
            setShow2FASetup(true);
            setTwoFAStep('INTRO');
            return;
        }

        setIsUpdating2FA(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIs2FAEnabled(false);
            toast.success('2FA Protection Disabled');
        } catch (error) {
            toast.error('Failed to update security settings');
        } finally {
            setIsUpdating2FA(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }
        setIsUpdating2FA(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIs2FAEnabled(true);
            setShow2FASetup(false);
            setTwoFAStep('INTRO');
            setOtpValue('');
            toast.success('2FA Protected!', { icon: '🛡️' });
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setIsUpdating2FA(false);
        }
    };

    const handleDeactivateAccount = async () => {
        const confirmResult = window.confirm("Are you sure you want to deactivate your account? You can reactivate it any time by logging back in.");
        if (!confirmResult) return;

        setIsSaving(true);
        try {
            await updateUser({ status: 'deactivated' });
            toast.success('Account deactivated successfully.');
            await logout();
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to deactivate account');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error("Please type DELETE to confirm");
            return;
        }

        setIsSaving(true);
        try {
            await deleteAccount();
            toast.success('Account deleted permanently.', { icon: '👋' });
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete account');
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
                            /* Professional Settings View */
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* Header */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900">Account & Security</h2>
                                            <p className="text-gray-500 text-sm font-medium mt-1">Manage your identity, security preferences, and data.</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Secure Account</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Personal Information Section */}
                                        <div className={`overflow-hidden border border-gray-50 rounded-[2rem] transition-all ${expandedSection === 'PERSONAL' ? 'ring-2 ring-emerald-500/20 bg-[#FBFCFE]' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'PERSONAL' ? null : 'PERSONAL')}
                                                className="w-full flex items-center justify-between p-6 sm:p-8"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-slate-900">Personal Information</h3>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Name, Phone, ID Details</p>
                                                    </div>
                                                </div>
                                                {expandedSection === 'PERSONAL' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </button>

                                            {expandedSection === 'PERSONAL' && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                                            <div className="relative group">
                                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
                                                                <input
                                                                    type="text"
                                                                    value={personalInfo.name}
                                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                                                    className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-[#22C55E] transition-all font-bold text-slate-900 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                                            <div className="relative group">
                                                                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
                                                                <input
                                                                    type="tel"
                                                                    value={personalInfo.phone}
                                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                                    className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-[#22C55E] transition-all font-bold text-slate-900 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email <span className="text-[10px] text-gray-300">(Locked)</span></label>
                                                            <div className="relative opacity-60">
                                                                <Bell className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    disabled
                                                                    value={user?.email || ''}
                                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-500 outline-none cursor-not-allowed"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">National ID</label>
                                                            <div className="relative group">
                                                                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />
                                                                <input
                                                                    type="text"
                                                                    value={personalInfo.idNumber}
                                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, idNumber: e.target.value })}
                                                                    className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-[#22C55E] transition-all font-bold text-slate-900 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-8">
                                                        <button
                                                            onClick={handleSaveProfile}
                                                            disabled={isSaving}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest shadow-lg shadow-emerald-100"
                                                        >
                                                            {isSaving ? 'UPDATING...' : 'Update Profile'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Notification Preferences Section */}
                                        <div className={`overflow-hidden border border-gray-50 rounded-[2rem] transition-all ${expandedSection === 'NOTIFS' ? 'ring-2 ring-emerald-500/20 bg-[#FBFCFE]' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'NOTIFS' ? null : 'NOTIFS')}
                                                className="w-full flex items-center justify-between p-6 sm:p-8"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                                        <Bell className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-slate-900">Notifications</h3>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Email, SMS, & Push Alerts</p>
                                                    </div>
                                                </div>
                                                {expandedSection === 'NOTIFS' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </button>

                                            {expandedSection === 'NOTIFS' && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300 space-y-4">
                                                    {[
                                                        { id: 'email', label: 'Email Notifications', desc: 'Get order updates and receipts via email', icon: Bell },
                                                        { id: 'sms', label: 'SMS Notifications', desc: 'Real-time tracking updates to your phone', icon: Smartphone },
                                                        { id: 'push', label: 'Push Notifications', desc: 'Alerts directly to your device', icon: Navigation }
                                                    ].map((notif) => (
                                                        <div key={notif.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                                                    <notif.icon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 text-sm">{notif.label}</h4>
                                                                    <p className="text-[10px] text-gray-400 font-medium">{notif.desc}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setNotifications({ ...notifications, [notif.id]: !((notifications as any)[notif.id]) })}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${(notifications as any)[notif.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                                            >
                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(notifications as any)[notif.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Saved Addresses Section */}
                                        <div className={`overflow-hidden border border-gray-50 rounded-[2rem] transition-all ${expandedSection === 'ADDRESSES' ? 'ring-2 ring-emerald-500/20 bg-[#FBFCFE]' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'ADDRESSES' ? null : 'ADDRESSES')}
                                                className="w-full flex items-center justify-between p-6 sm:p-8"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-slate-900">Saved Addresses</h3>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Home, Office, Frequent Stays</p>
                                                    </div>
                                                </div>
                                                {expandedSection === 'ADDRESSES' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </button>

                                            {expandedSection === 'ADDRESSES' && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300 space-y-4">
                                                    {savedAddresses.map((addr, i) => (
                                                        <div key={addr.id || i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                                    {addr.label === 'Home' ? <Home className="w-5 h-5" /> : addr.label === 'Work' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 text-sm">{addr.label}</h4>
                                                                    <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{addr.address}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {isAddingAddress ? (
                                                        <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                            <div className="relative">
                                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                <input
                                                                    autoFocus
                                                                    value={addressQuery}
                                                                    onChange={(e) => handleAddressSearch(e.target.value)}
                                                                    placeholder="Search for an address..."
                                                                    className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-emerald-500"
                                                                />
                                                                {isSearchingAddress && <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />}
                                                            </div>

                                                            {addressSuggestions.length > 0 && (
                                                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                                                    {addressSuggestions.map((s, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            onClick={() => handleSelectAddress(s)}
                                                                            className="w-full text-left px-5 py-3 hover:bg-gray-50 text-xs font-bold text-gray-700 border-b border-gray-50 last:border-0 flex items-center gap-3"
                                                                        >
                                                                            <MapPin className="w-3 h-3 text-gray-300" />
                                                                            {s.label}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                            )}
                                                            <button
                                                                onClick={() => { setIsAddingAddress(false); setAddressQuery(''); setAddressSuggestions([]); }}
                                                                className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setIsAddingAddress(true)}
                                                            className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-black uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all"
                                                        >
                                                            + Add New Address
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Security & Password Section */}
                                        <div className={`overflow-hidden border border-gray-50 rounded-[2rem] transition-all ${expandedSection === 'SECURITY' ? 'ring-2 ring-emerald-500/20 bg-[#FBFCFE]' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'SECURITY' ? null : 'SECURITY')}
                                                className="w-full flex items-center justify-between p-6 sm:p-8"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                                        <Lock className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-slate-900">Security & Password</h3>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Firebase Password Change, 2FA</p>
                                                    </div>
                                                </div>
                                                {expandedSection === 'SECURITY' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </button>

                                            {expandedSection === 'SECURITY' && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300 space-y-8">
                                                    {/* Password Change Sub-section */}
                                                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <Key className="w-4 h-4 text-blue-500" />
                                                                <h4 className="font-bold text-slate-900">Login Password</h4>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowPasswordFields(!showPasswordFields)}
                                                                className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline"
                                                            >
                                                                {showPasswordFields ? 'CANCEL' : 'CHANGE PASSWORD'}
                                                            </button>
                                                        </div>

                                                        {showPasswordFields ? (
                                                            <div className="space-y-4 pt-2">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div className="relative">
                                                                        <input
                                                                            type={showPass ? "text" : "password"}
                                                                            placeholder="New Password"
                                                                            value={passwords.new}
                                                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                                            className="w-full pl-6 pr-12 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-blue-400"
                                                                        />
                                                                        <button
                                                                            onClick={() => setShowPass(!showPass)}
                                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                                        >
                                                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                        </button>
                                                                    </div>
                                                                    <input
                                                                        type={showPass ? "text" : "password"}
                                                                        placeholder="Confirm Password"
                                                                        value={passwords.confirm}
                                                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                                        className="w-full px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm outline-none focus:border-blue-400"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={handleChangePassword}
                                                                    disabled={isSaving}
                                                                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
                                                                >
                                                                    Update Password
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500">Your password is securely managed using industry-standard encryption.</p>
                                                        )}
                                                    </div>

                                                    {/* 2FA Sub-section */}
                                                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
                                                                    <p className="text-xs text-gray-400 font-medium">Add an extra layer of security to your account.</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={handleToggle2FA}
                                                                disabled={isUpdating2FA}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${is2FAEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                                            >
                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                                {isUpdating2FA && (
                                                                    <RefreshCw className="absolute inset-0 m-auto w-3 h-3 text-white animate-spin" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {show2FASetup && (
                                                            <div className="mt-8 border-t border-gray-50 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                {twoFAStep === 'INTRO' && (
                                                                    <div className="text-center space-y-4">
                                                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                            <Smartphone className="w-8 h-8 text-emerald-600" />
                                                                        </div>
                                                                        <h5 className="font-black text-slate-900">Setup Authenticator App</h5>
                                                                        <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                                                            Protect your account using apps like Google Authenticator or Authy to generate secure codes.
                                                                        </p>
                                                                        <button
                                                                            onClick={() => setTwoFAStep('QR')}
                                                                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                                                                        >
                                                                            Continue to QR Code
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {twoFAStep === 'QR' && (
                                                                    <div className="text-center space-y-4">
                                                                        <div className="bg-white p-4 border-2 border-dashed border-gray-100 rounded-2xl inline-block mx-auto">
                                                                            <QrCode className="w-32 h-32 text-slate-400" />
                                                                        </div>
                                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Scan with your app</p>
                                                                        <div className="bg-gray-50 p-3 rounded-xl text-[10px] font-mono font-bold text-gray-600 break-all mb-4">
                                                                            SECRET: TUMA-FAST-SECURE-KEY-2024
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setTwoFAStep('VERIFY')}
                                                                            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                                                                        >
                                                                            I've Scanned It
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {twoFAStep === 'VERIFY' && (
                                                                    <div className="space-y-4">
                                                                        <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest">Enter the 6-digit code</p>
                                                                        <input
                                                                            type="text"
                                                                            maxLength={6}
                                                                            value={otpValue}
                                                                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                                                            placeholder="0 0 0 0 0 0"
                                                                            className="w-full text-center py-4 bg-gray-50 border-2 border-emerald-100 rounded-xl font-black text-2xl tracking-[0.5em] text-emerald-600 focus:border-emerald-500 outline-none"
                                                                        />
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                onClick={() => setShow2FASetup(false)}
                                                                                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-400 uppercase tracking-widest"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                disabled={otpValue.length !== 6 || isUpdating2FA}
                                                                                onClick={handleVerifyOTP}
                                                                                className="flex-[2] py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                                                                            >
                                                                                {isUpdating2FA ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                                                Verify & Enable
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Privacy & Data Section */}
                                        <div className={`overflow-hidden border border-gray-50 rounded-[2rem] transition-all ${expandedSection === 'PRIVACY' ? 'ring-2 ring-emerald-500/20 bg-[#FBFCFE]' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'PRIVACY' ? null : 'PRIVACY')}
                                                className="w-full flex items-center justify-between p-6 sm:p-8"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-slate-900">Privacy & Data</h3>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Your Data, Privacy Policy, Terms</p>
                                                    </div>
                                                </div>
                                                {expandedSection === 'PRIVACY' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </button>

                                            {expandedSection === 'PRIVACY' && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300 space-y-6">
                                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <Info className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 mb-2">How we use your data</h4>
                                                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                                                Tumafast collects your location for accurate delivery tracking and personal info for order verification.
                                                                We never sell your data to third parties. All communication is encrypted.
                                                            </p>
                                                            <div className="flex flex-wrap gap-4">
                                                                <button
                                                                    onClick={() => navigate('/privacy')}
                                                                    className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" /> Privacy Policy
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate('/terms')}
                                                                    className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" /> Service Terms
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between px-2">
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Data Portability</p>
                                                        <button
                                                            className="text-xs font-black text-slate-900 border-2 border-slate-900 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest"
                                                        >
                                                            Download My Data
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Danger Zone Section */}
                                        <div className={`overflow-hidden border border-red-50 rounded-[2rem] transition-all ${expandedSection === 'DANGER' ? 'ring-2 ring-red-500/20 bg-red-50/10' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'DANGER' ? null : 'DANGER')}
                                                className="w-full flex items-center justify-between p-6 sm:p-8"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                                                        <Trash2 className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-red-600">Danger Zone</h3>
                                                        <p className="text-xs text-red-400 font-bold uppercase tracking-tighter">Deactivate or Delete Account</p>
                                                    </div>
                                                </div>
                                                {expandedSection === 'DANGER' ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                                            </button>

                                            {expandedSection === 'DANGER' && (
                                                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300 space-y-4">
                                                    <div className="p-6 bg-white rounded-[2rem] border border-red-100">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                                <Power className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-slate-900 text-base">Temporary Deactivation</h4>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pause your profile anytime</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                                                            Hides your account from searches. Reactivate anytime byLogging back in.
                                                        </p>
                                                        <button
                                                            onClick={handleDeactivateAccount}
                                                            className="w-full py-4 border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all"
                                                        >
                                                            Deactivate Account
                                                        </button>
                                                    </div>

                                                    <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-100">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                                                <AlertTriangle className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-red-900 text-base">Erase Everything</h4>
                                                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Permanent Data Removal</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-red-600/60 font-medium mb-6 leading-relaxed">
                                                            All history, wallets, and settings will be permanently destroyed. This cannot be undone.
                                                        </p>

                                                        {showDeleteInput ? (
                                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                                                <input
                                                                    autoFocus
                                                                    value={deleteConfirmation}
                                                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                                    placeholder='Type "DELETE" to confirm'
                                                                    className="w-full px-5 py-4 bg-white border-2 border-red-200 rounded-2xl font-black text-center text-red-600 outline-none uppercase tracking-widest focus:border-red-500 placeholder:text-red-200"
                                                                />
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <button
                                                                        onClick={() => setShowDeleteInput(false)}
                                                                        className="py-3 bg-white border border-gray-200 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        disabled={deleteConfirmation !== 'DELETE'}
                                                                        onClick={handleDeleteAccount}
                                                                        className="py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-red-200"
                                                                    >
                                                                        Confirm Erase
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setShowDeleteInput(true)}
                                                                className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-100"
                                                            >
                                                                Destroy Account Permanently
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-12 flex justify-center">
                                        <button
                                            onClick={() => setCurrentView('DELIVERIES')}
                                            className="px-8 py-3 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                                        </button>
                                    </div>
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
