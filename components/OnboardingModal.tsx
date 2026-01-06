
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    X, User, Truck, Briefcase, FileText, Phone, MapPin,
    ArrowRight, Loader, CheckCircle, Shield, Building2, LogOut, AlertTriangle
} from 'lucide-react';
import { VehicleType } from '../types';

const OnboardingModal: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [kraPin, setKraPin] = useState('');

    // Driver specific
    const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.BODA);
    const [plateNumber, setPlateNumber] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    useEffect(() => {
        if (user) {
            const isDriver = user.role === 'driver';
            const isBusiness = user.role === 'business';

            // If already marked as onboarded, don't show the modal
            if (user.onboarded) {
                setIsOpen(false);
                return;
            }

            // Check for core requirements: Name, Phone, ID Number
            const hasCoreInfo = user.name && user.phone && user.idNumber;

            const needsOnboarding =
                !user.onboarded ||
                !hasCoreInfo ||
                (isDriver && (!user.licenseNumber || !user.plateNumber || !user.kraPin || !user.address || !user.vehicleType)) ||
                (isBusiness && (!user.kraPin || !user.address));

            if (needsOnboarding) {
                setIsOpen(true);
                setName(isBusiness ? (user.companyName || user.name || '') : (user.name || ''));
                setPhone(user.phone || '');
                setAddress(user.address || '');
                setKraPin(user.kraPin || '');
                setIdNumber(user.idNumber || '');
                if (isDriver) {
                    setVehicleType(user.vehicleType || VehicleType.BODA);
                    setPlateNumber(user.plateNumber || '');
                    setLicenseNumber(user.licenseNumber || '');
                }
            } else {
                setIsOpen(false);
            }
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const validateForm = () => {
        if (!name) return "Full name is required";
        if (!phone || phone.length < 10) return "Valid phone number is required";
        if (!idNumber) return "National ID number is required";

        // Drivers and Businesses need more
        if (user.role !== 'customer') {
            if (!address) return "Address/Location is required";
            if (!kraPin) return "KRA PIN is required";
        }

        if (user.role === 'driver') {
            if (!licenseNumber) return "Driving License number is required";
            if (!plateNumber) return "Vehicle Plate Number is required";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const updates: any = {
                name,
                phone,
                idNumber,
                onboarded: true
            };

            if (user.role !== 'customer') {
                updates.address = address;
                updates.kraPin = kraPin.toUpperCase();
            }

            if (user.role === 'driver') {
                updates.licenseNumber = licenseNumber;
                updates.plateNumber = plateNumber.toUpperCase();
                updates.vehicleType = vehicleType;
            } else if (user.role === 'business') {
                updates.companyName = name;
            }

            await updateUser(updates);
            setIsOpen(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-gray-100">
                {/* Header */}
                <div className="px-8 py-8 bg-brand-600 text-white relative">
                    <div className="flex items-center space-x-3 mb-2">
                        <Shield className="w-6 h-6 text-brand-200" />
                        <h2 className="text-2xl font-extrabold tracking-tight">Complete Your Profile</h2>
                    </div>
                    <p className="text-brand-100 text-sm">
                        We need a few more details to get your {user.role} account verified and ready for deliveries.
                    </p>

                    <div className="absolute -bottom-6 right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-white">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Common Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    {user.role === 'business' ? 'Company Name' : 'Full Name'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                        {user.role === 'business' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm placeholder:text-gray-400"
                                        placeholder={user.role === 'business' ? "e.g. Acme Logistics" : "Your Name"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center">
                                    Phone Number <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">Required</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm placeholder:text-gray-400"
                                        placeholder="0700 000 000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">National ID Number</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm placeholder:text-gray-400"
                                    placeholder="12345678"
                                />
                            </div>
                        </div>

                        {user.role !== 'customer' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">KRA PIN Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={kraPin}
                                            onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm uppercase placeholder:text-gray-400"
                                            placeholder="P000000000Z"
                                            maxLength={11}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        {user.role === 'driver' ? 'Home Location' : 'Physical Address'}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm placeholder:text-gray-400"
                                            placeholder="e.g. Westlands, Nairobi"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Driver Specific Fields */}
                        {user.role === 'driver' && (
                            <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-4">
                                <div className="h-px bg-gray-100 w-full"></div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                    <Truck className="w-4 h-4 mr-2" /> Vehicle & Identification
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">License No.</label>
                                        <input
                                            type="text"
                                            required
                                            value={licenseNumber}
                                            onChange={(e) => setLicenseNumber(e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm placeholder:text-gray-400"
                                            placeholder="DL-000000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Vehicle Type</label>
                                        <select
                                            value={vehicleType}
                                            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                        >
                                            {Object.values(VehicleType).map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Plate Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={plateNumber}
                                        onChange={(e) => setPlateNumber(e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-sm uppercase placeholder:text-gray-400"
                                        placeholder="KDA 001A"
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex-1 px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm border border-transparent shadow-sm flex items-center justify-center space-x-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] bg-brand-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-500/25 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                        {loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Complete Registration</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
