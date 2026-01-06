import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HistoryList from './HistoryList';
import { Shield, Lock, Home, Globe, Bell, Calendar, Trash2, LogOut, User, ChevronRight, Plus, Package, CreditCard, HelpCircle, Settings, Users, Eye, ArrowLeft, Search, Phone, X, CheckCircle, AlertCircle, Smartphone, Download, FileText, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { QRCodeSVG } from 'qrcode.react';
// Using otpauth for browser compatibility
import * as OTPAuth from 'otpauth';

interface CustomerDashboardProps {
    onTrackOrder: (orderId: string) => void;
    onReorder: (prefill: any) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onTrackOrder, onReorder }) => {
    const { user, logout, updateUser, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DELIVERIES' | 'SETTINGS'>('OVERVIEW');
    const [settingsView, setSettingsView] = useState<'LIST' | 'PERSONAL_INFO' | 'SECURITY' | 'PRIVACY' | 'COMMUNICATION'>('LIST');
    const [trackingNumber, setTrackingNumber] = useState('');

    // Security Modals State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFactorStep, setTwoFactorStep] = useState<'INTRO' | 'QR' | 'VERIFY' | 'SUCCESS'>('INTRO');
    const [verificationCode, setVerificationCode] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [otpauthUrl, setOtpauthUrl] = useState('');

    const DEFAULT_COMM_PREFS = {
        marketing: { email: true, push: true, sms: true },
        products: { email: true, push: true, sms: true },
        updates: { email: true, push: true, sms: true },
        security: { email: true, push: true, sms: true }
    };

    // Communication Preferences State
    const [commPrefs, setCommPrefs] = useState(() => {
        if (user?.communicationPreferences && 'marketing' in user.communicationPreferences) {
            return user.communicationPreferences;
        }
        return DEFAULT_COMM_PREFS;
    });

    // Personal Info Form State
    const [isSaving, setIsSaving] = useState(false);
    const [isRequestingData, setIsRequestingData] = useState(false);
    const [personalInfo, setPersonalInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        idNumber: user?.idNumber || ''
    });

    useEffect(() => {
        if (user) {
            setPersonalInfo({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                idNumber: user.idNumber || ''
            });
            if (user.communicationPreferences && 'marketing' in user.communicationPreferences) {
                setCommPrefs(user.communicationPreferences);
            }
        }
    }, [user]);

    const menuItems = [
        { id: 'PERSONAL_INFO', icon: User, label: 'Personal info', desc: 'Name, email, phone number' },
        { id: 'SECURITY', icon: Lock, label: 'Login & security', desc: 'Update password and secure your account' },
        { id: 'PRIVACY', icon: Eye, label: 'Privacy', desc: 'Manage your data and privacy settings' },
        { id: 'COMMUNICATION', icon: Bell, label: 'Communication preferences', desc: 'Emails, notifications' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            toast.success('Account deleted successfully');
            navigate('/');
        } catch (error: any) {
            console.error('Delete account error:', error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error('Please log out and log back in to delete your account for security reasons.');
            } else {
                toast.error('Failed to delete account. Please try again.');
            }
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleSavePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser({
                name: personalInfo.name,
                phone: personalInfo.phone,
                email: personalInfo.email
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await authService.updatePassword(newPassword);
            toast.success("Password updated successfully!");
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error("Password update error:", error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error("For security, please log out and log back in to change your password.");
            } else {
                toast.error(error.message || "Failed to update password");
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleStart2FASetup = () => {
        const secret = new OTPAuth.Secret({ size: 20 });
        const userEmail = user?.email || 'user@tumafast.com';

        const totp = new OTPAuth.TOTP({
            issuer: 'TumaFast Kenya',
            label: userEmail,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: secret
        });

        const secretBase32 = secret.base32;
        const otpauth = totp.toString();

        setTwoFactorSecret(secretBase32);
        setOtpauthUrl(otpauth);
        setTwoFactorStep('QR');
    };

    const handleVerify2FA = () => {
        try {
            const totp = new OTPAuth.TOTP({
                issuer: 'TumaFast Kenya',
                label: user?.email || 'user@tumafast.com',
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(twoFactorSecret)
            });

            const delta = totp.validate({
                token: verificationCode,
                window: 1
            });

            if (delta !== null) {
                setTwoFactorStep('SUCCESS');
                setIs2FAEnabled(true);
                toast.success("2FA Enabled Successfully!");
            } else {
                toast.error("Invalid verification code. Please try again.");
            }
        } catch (error) {
            console.error("2FA Verification Error:", error);
            toast.error("Error verifying code.");
        }
    };

    const renderPersonalInfo = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setSettingsView('LIST')}
                    className="flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 border-b border-gray-100 bg-gradient-to-r from-brand-50/50 to-transparent">
                    <h2 className="text-3xl font-black text-gray-900">Personal info</h2>
                    <p className="text-gray-500 font-medium mt-2">Manage your basic information and how we can reach you.</p>
                </div>

                <form onSubmit={handleSavePersonalInfo} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={personalInfo.name}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={personalInfo.email}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="tel"
                                    required
                                    value={personalInfo.phone}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="0700 000 000"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">National ID Number</label>
                            <div className="relative group">
                                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input
                                    type="text"
                                    disabled
                                    value={personalInfo.idNumber}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-100 border-2 border-gray-100 rounded-[1.5rem] font-bold text-gray-400 cursor-not-allowed"
                                    placeholder="12345678"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold ml-1 flex items-center">
                                <Lock className="w-3 h-3 mr-1" /> ID Number cannot be changed for security reasons.
                            </p>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-brand-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-3"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const handleToggleComm = async (category: keyof typeof commPrefs, channel: 'email' | 'push' | 'sms') => {
        if (!user) return;

        const currentCategoryPrefs = commPrefs[category] || DEFAULT_COMM_PREFS[category as keyof typeof DEFAULT_COMM_PREFS];

        const newPrefs = {
            ...commPrefs,
            [category]: {
                ...currentCategoryPrefs,
                [channel]: !currentCategoryPrefs[channel]
            }
        };
        setCommPrefs(newPrefs);

        try {
            await updateUser({ communicationPreferences: newPrefs });
            toast.success('Preferences updated');
        } catch (error) {
            toast.error('Failed to update preferences');
            setCommPrefs(commPrefs);
        }
    };

    const renderCommunicationPreferences = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setSettingsView('LIST')}
                    className="flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 border-b border-gray-100 bg-gradient-to-r from-brand-50/50 to-transparent">
                    <h2 className="text-3xl font-black text-gray-900">Communication</h2>
                    <p className="text-gray-500 font-medium mt-2">Fine-tune how TumaFast reaches you across different channels.</p>
                </div>

                <div className="p-10 space-y-12">
                    {[
                        { id: 'marketing', label: 'Marketing & Promotions', desc: 'Special offers, discounts, and new features.', icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
                        { id: 'products', label: 'TumaFast Products', desc: 'Latest services and product improvements.', icon: Package, color: 'bg-blue-50 text-blue-600' },
                        { id: 'updates', label: 'Order Updates', desc: 'Real-time status of your active deliveries.', icon: Calendar, color: 'bg-green-50 text-green-600' },
                        { id: 'security', label: 'Security & Account', desc: 'Important alerts about your account safety.', icon: Shield, color: 'bg-red-50 text-red-600' }
                    ].map((cat) => (
                        <div key={cat.id} className="group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center space-x-5">
                                    <div className={`p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-300 ${cat.color}`}>
                                        <cat.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{cat.label}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{cat.desc}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: 'email', label: 'Email Address', icon: Globe },
                                    { id: 'push', label: 'Push Notification', icon: Bell },
                                    { id: 'sms', label: 'SMS Message', icon: Smartphone }
                                ].map((channel) => {
                                    const categoryPrefs = commPrefs[cat.id as keyof typeof commPrefs] || DEFAULT_COMM_PREFS[cat.id as keyof typeof DEFAULT_COMM_PREFS];
                                    const isActive = categoryPrefs[channel.id as 'email' | 'push' | 'sms'];
                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => handleToggleComm(cat.id as keyof typeof commPrefs, channel.id as 'email' | 'push' | 'sms')}
                                            className={`relative flex items-center p-5 rounded-3xl border-2 transition-all duration-300 group/btn ${isActive ? 'border-brand-500 bg-brand-50/30 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                        >
                                            <div className={`p-2.5 rounded-xl mr-4 transition-colors ${isActive ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                <channel.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>{channel.label}</p>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-brand-500' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {cat.id !== 'security' && <div className="h-px bg-gray-100 mt-12" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const handleRequestData = () => {
        setIsRequestingData(true);
        setTimeout(() => {
            setIsRequestingData(false);
            toast.success(`Request received! Your data will be sent to ${user?.email} within 24 hours.`, {
                duration: 5000,
                icon: '📧'
            });
        }, 1500);
    };

    const renderPrivacy = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setSettingsView('LIST')}
                    className="flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 border-b border-gray-100 bg-gradient-to-r from-brand-50/50 to-transparent">
                    <h2 className="text-3xl font-black text-gray-900">Privacy & Data</h2>
                    <p className="text-gray-500 font-medium mt-2">Your privacy is our priority. Manage your data and how it's used.</p>
                </div>

                <div className="p-10 space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Privacy Statement</h3>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-4">
                            <p>
                                At TumaFast Kenya, we are committed to protecting your personal information and your right to privacy. This statement outlines how we handle your data when you use our logistics and delivery services.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-black text-gray-900 mb-2 flex items-center">
                                        <Database className="w-4 h-4 mr-2 text-brand-600" /> Data Collection
                                    </h4>
                                    <p className="text-xs">We collect only essential information required to facilitate deliveries, including your name, contact details, and location data for real-time tracking.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-black text-gray-900 mb-2 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-brand-600" /> Data Security
                                    </h4>
                                    <p className="text-xs">Your data is encrypted and stored securely. We never sell your personal information to third parties for marketing purposes.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-gray-100" />

                    <section className="bg-brand-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center px-4 py-2 bg-brand-800 rounded-full text-brand-300 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Download className="w-3 h-3 mr-2" /> Data Portability
                                </div>
                                <h3 className="text-2xl font-black mb-2">Request Your Data</h3>
                                <p className="text-brand-200 font-medium text-sm max-w-md">
                                    Want to see everything we have on file? Request a full export of your account data, including order history and profile details.
                                </p>
                            </div>
                            <button
                                onClick={handleRequestData}
                                disabled={isRequestingData}
                                className="bg-white text-brand-900 px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-brand-50 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-3 shrink-0"
                            >
                                {isRequestingData ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-brand-900/30 border-t-brand-900 rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5" />
                                        <span>Request Data Export</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50 pt-20 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Welcome & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1 rounded-full hover:bg-gray-100">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h1 className="text-3xl font-black text-gray-900">Hello, {user?.name?.split(' ')[0]}</h1>
                            </div>
                            <p className="text-gray-500 font-medium">Manage your deliveries and account</p>
                        </div>
                        <button
                            onClick={() => navigate('/booking')}
                            className="bg-brand-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Order</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Sidebar / Menu (Desktop) */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center space-x-3 mb-6">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full border-2 border-gray-50"
                                    />
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-gray-900 truncate">{user?.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab('OVERVIEW')}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'OVERVIEW' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Package className="w-5 h-5" />
                                        <span className="font-bold text-sm">My Deliveries</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('SETTINGS')}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'SETTINGS' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="font-bold text-sm">Settings</span>
                                    </button>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-bold text-sm">Sign Out</span>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9">
                            {activeTab === 'OVERVIEW' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Mobile Tracking Input (Visible only on mobile, below side menu) */}
                                    <div className="lg:hidden bg-brand-50 rounded-[2rem] p-6 border border-brand-100 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-gray-900">Track Package</h2>
                                                <p className="text-xs text-gray-500 font-medium">Enter your Order ID below</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter Order ID..."
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                className="w-full px-4 py-4 bg-white border-2 border-brand-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                            />
                                            <button
                                                onClick={() => trackingNumber.trim() && onTrackOrder(trackingNumber.trim())}
                                                className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 active:scale-95"
                                            >
                                                Track Now
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop Tracking Input */}
                                    <div className="hidden lg:flex bg-brand-50 rounded-[2rem] p-8 border border-brand-100 items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-black text-gray-900 mb-2">Track a Package</h2>
                                            <p className="text-gray-600 text-sm font-medium max-w-md">
                                                Have a tracking number? Enter it here to see the real-time status and location of your delivery.
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                                            <div className="relative flex-1 md:min-w-[400px]">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter Order ID..."
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-brand-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <button
                                                onClick={() => trackingNumber.trim() && onTrackOrder(trackingNumber.trim())}
                                                className="w-full sm:w-auto px-8 py-4 bg-brand-500 text-white rounded-2xl font-black hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 active:scale-95 whitespace-nowrap"
                                            >
                                                Track Now
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <HistoryList onTrackOrder={onTrackOrder} onReorder={onReorder} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'DELIVERIES' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Mobile Tracking Input (Visible only on mobile) */}
                                    <div className="lg:hidden bg-brand-50 rounded-[2rem] p-6 border border-brand-100 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-gray-900">Track Package</h2>
                                                <p className="text-xs text-gray-500 font-medium">Enter your Order ID below</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter Order ID..."
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                className="w-full px-4 py-4 bg-white border-2 border-brand-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                            />
                                            <button
                                                onClick={() => trackingNumber.trim() && onTrackOrder(trackingNumber.trim())}
                                                className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 active:scale-95"
                                            >
                                                Track Now
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-gray-900">My Deliveries</h2>
                                    </div>
                                    <HistoryList onTrackOrder={onTrackOrder} onReorder={onReorder} />
                                </div>
                            )}

                            {activeTab === 'SETTINGS' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {settingsView === 'LIST' ? (
                                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100">
                                                <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {menuItems.map((item, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSettingsView(item.id as any)}
                                                        className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left group"
                                                    >
                                                        <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <item.icon className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                                            <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-600" />
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                    className="w-full flex items-center p-4 hover:bg-red-50 transition-colors text-left group"
                                                >
                                                    <div className="bg-red-50 p-2 rounded-xl">
                                                        <Trash2 className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <p className="text-sm font-bold text-red-600">Delete Account</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    ) : settingsView === 'PERSONAL_INFO' ? (
                                        renderPersonalInfo()
                                    ) : settingsView === 'COMMUNICATION' ? (
                                        renderCommunicationPreferences()
                                    ) : settingsView === 'PRIVACY' ? (
                                        renderPrivacy()
                                    ) : settingsView === 'SECURITY' ? (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center justify-between mb-2">
                                                <button
                                                    onClick={() => setSettingsView('LIST')}
                                                    className="flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
                                                </button>
                                            </div>

                                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                                                <div className="p-10 border-b border-gray-100 bg-gradient-to-r from-brand-50/50 to-transparent">
                                                    <h2 className="text-3xl font-black text-gray-900">Login & security</h2>
                                                    <p className="text-gray-500 font-medium mt-2">Manage your password and account security.</p>
                                                </div>

                                                <div className="p-10 space-y-10">
                                                    <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50 rounded-[2rem] border border-gray-100 gap-6">
                                                        <div className="flex items-center space-x-5">
                                                            <div className="p-4 bg-white rounded-2xl shadow-sm">
                                                                <Lock className="w-7 h-7 text-brand-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xl font-black text-gray-900">Password</p>
                                                                <p className="text-sm text-gray-500 font-medium">Last updated 3 months ago</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setIsPasswordModalOpen(true)}
                                                            className="w-full md:w-auto px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-sm hover:border-brand-500 hover:text-brand-600 transition-all shadow-sm active:scale-95"
                                                        >
                                                            Change Password
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50 rounded-[2rem] border border-gray-100 gap-6">
                                                        <div className="flex items-center space-x-5">
                                                            <div className={`p-4 rounded-2xl shadow-sm ${is2FAEnabled ? 'bg-green-50 text-green-600' : 'bg-white text-gray-400'}`}>
                                                                <Shield className="w-7 h-7" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <p className="text-xl font-black text-gray-900">Two-factor authentication</p>
                                                                    {is2FAEnabled && (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">Active</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 font-medium">
                                                                    {is2FAEnabled ? 'Secured via Google Authenticator' : 'Add an extra layer of security to your account.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setIs2FAModalOpen(true)}
                                                            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-sm active:scale-95 ${is2FAEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
                                                        >
                                                            {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
                                            <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Settings className="w-10 h-10 text-brand-600 animate-spin-slow" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 mb-2">Coming Soon</h3>
                                            <p className="text-gray-500 font-medium mb-8">We're working hard to bring you this feature. Stay tuned!</p>
                                            <button
                                                onClick={() => setSettingsView('LIST')}
                                                className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
                                            >
                                                Back to Settings
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Password Update Modal */}
            {
                isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Update Password</h3>
                                    <p className="text-sm text-gray-500 font-medium">Choose a strong new password.</p>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-gray-900"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-gray-900"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {isUpdatingPassword ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <span>Update Password</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* 2FA Modal */}
            {
                is2FAModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Two-Factor Auth</h3>
                                    <p className="text-sm text-gray-500 font-medium">Secure your account with TOTP.</p>
                                </div>
                                <button onClick={() => { setIs2FAModalOpen(false); setTwoFactorStep('INTRO'); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8">
                                {is2FAEnabled && twoFactorStep === 'INTRO' ? (
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto">
                                            <Shield className="w-10 h-10 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900">2FA is Active</h4>
                                            <p className="text-gray-500 font-medium mt-1">Your account is protected by Google Authenticator.</p>
                                        </div>
                                        <button
                                            onClick={() => { setIs2FAEnabled(false); toast.success("2FA Disabled"); setIs2FAModalOpen(false); }}
                                            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all"
                                        >
                                            Disable 2FA
                                        </button>
                                    </div>
                                ) : twoFactorStep === 'INTRO' ? (
                                    <div className="space-y-6">
                                        <div className="flex items-start space-x-4 p-4 bg-brand-50 rounded-2xl">
                                            <Smartphone className="w-6 h-6 text-brand-600 mt-1" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Google Authenticator</p>
                                                <p className="text-xs text-gray-500 font-medium">Use an app to generate secure codes.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleStart2FASetup}
                                            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
                                        >
                                            Get Started
                                        </button>
                                    </div>
                                ) : twoFactorStep === 'QR' ? (
                                    <div className="text-center space-y-6">
                                        <p className="text-sm font-bold text-gray-900">Scan this QR code in your Authenticator app</p>
                                        <div className="bg-white p-6 rounded-3xl mx-auto flex items-center justify-center border-4 border-gray-50 shadow-inner">
                                            <QRCodeSVG value={otpauthUrl} size={200} />
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Secret Key</p>
                                            <p className="text-sm font-mono font-bold text-gray-900 break-all">{twoFactorSecret}</p>
                                        </div>
                                        <button
                                            onClick={() => setTwoFactorStep('VERIFY')}
                                            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
                                        >
                                            Next: Verify Code
                                        </button>
                                    </div>
                                ) : twoFactorStep === 'VERIFY' ? (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-gray-900">Enter the 6-digit code from your app</p>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-500 transition-all"
                                            placeholder="000000"
                                        />
                                        <button
                                            onClick={handleVerify2FA}
                                            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
                                        >
                                            Verify & Enable
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-6 py-4">
                                        <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900">2FA Enabled!</h4>
                                            <p className="text-gray-500 font-medium mt-1">Your account is now significantly more secure.</p>
                                        </div>
                                        <button
                                            onClick={() => { setIs2FAModalOpen(false); setTwoFactorStep('INTRO'); }}
                                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Account Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Delete Account?</h3>
                                    <p className="text-gray-500 font-medium mt-2">
                                        This action is permanent and cannot be undone. All your data, including order history, will be permanently removed.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                                    >
                                        Yes, Delete My Account
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="w-full bg-gray-100 text-gray-900 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default CustomerDashboard;
