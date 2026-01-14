import React, { useState, useEffect, useRef } from 'react';
import type { User, DeliveryOrder, AddressBookEntry } from '../types';
import { VehicleType, ServiceType } from '../types';
import { LayoutDashboard, Upload, BarChart3, Download, Plus, Search, FileText, CheckCircle2, AlertCircle, Copy, Check, Terminal, Trash2, MapPin, Building, Home, User as UserIcon, Edit2, Save, Menu, X, Package, Shield, Mail, Phone, Briefcase, ArrowRight, Truck, ChevronRight, RefreshCw, Battery, Map as MapIcon, Navigation, Car, Hash, AlignLeft, MoreVertical, Clock, AlertTriangle, Bike, PieChart, TrendingUp, Activity, Eye, EyeOff, Globe, Server, Play, Code, LogOut, Star, Lock, Key, QrCode, ShieldCheck, FileCheck, ChevronUp, ChevronDown, CheckCircle, Power } from 'lucide-react';
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow } from '@react-google-maps/api';
import { APP_CONFIG } from '../config';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { LOCATION_COORDINATES } from '../constants';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface BusinessDashboardProps {
    user: User;
    onNewRequest: (prefill?: any) => void;
    onGoHome: () => void;
    onTrackOrder: (orderId: string) => void;
    initialTab?: string;
}

// Helper to resolve coordinates
const resolveCoords = (locationName: string): [number, number] => {
    if (!locationName) return [-1.2921, 36.8219]; // Default Nairobi

    const normalize = (s: string) => s.toLowerCase().trim();
    const target = normalize(locationName);

    const keys = Object.keys(LOCATION_COORDINATES).sort((a, b) => b.length - a.length);
    const match = keys.find(k => target.includes(normalize(k)));

    if (match) {
        // Add small random jitter so vehicles at same location don't overlap perfectly
        const base = LOCATION_COORDINATES[match];
        return [base[0] + (Math.random() * 0.005 - 0.0025), base[1] + (Math.random() * 0.005 - 0.0025)];
    }
    return [-1.2921, 36.8219];
};

// Helper for Icons
const getVehicleIcon = (type: string) => {
    if (type === VehicleType.BODA) return Bike;
    if (type === VehicleType.TUKTUK) return Car;
    return Truck;
};

const LIBRARIES: ("places" | "geometry")[] = ['places', 'geometry'];

// Dummy Fleet Data
const INITIAL_FLEET = [
    { id: 'FL-001', name: 'John Kimani', phone: '0711 000 111', vehicle: 'Boda Boda', plate: 'KMD 123A', status: 'ACTIVE', location: 'Westlands', battery: 85, lastPing: '2m ago' },
    { id: 'FL-002', name: 'Peter Omondi', phone: '0722 000 222', vehicle: 'Cargo Van', plate: 'KCD 456B', status: 'IDLE', location: 'Industrial Area', battery: 90, lastPing: '5m ago' },
    { id: 'FL-003', name: 'Sarah Wanjiku', phone: '0733 000 333', vehicle: 'Tuk-Tuk', plate: 'KTW 789C', status: 'OFFLINE', location: 'Mombasa Road', battery: 0, lastPing: '2h ago' },
    { id: 'FL-004', name: 'David Koech', phone: '0744 000 444', vehicle: 'Pickup Truck', plate: 'KBQ 101D', status: 'ACTIVE', location: 'Kilimani', battery: 60, lastPing: '1m ago' },
];

const CODE_SNIPPETS = {
    curl: `curl -X POST https://api.tumafast.co.ke/v1/orders \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "pickup": "Westlands",
    "dropoff": "CBD",
    "items": "Documents",
    "vehicle": "BODA"
  }'`,
    node: `const tumafast = require('tumafast')('sk_live_...');

const order = await tumafast.orders.create({
  pickup: 'Westlands',
  dropoff: 'CBD',
  items: 'Documents',
  vehicle: 'BODA'
});

console.log(order.id);`,
    python: `import tumafast
tumafast.api_key = "sk_live_..."

order = tumafast.Order.create(
    pickup="Westlands",
    dropoff="CBD",
    items="Documents",
    vehicle="BODA"
)

print(order.id)`
};

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ user, onNewRequest, onGoHome, onTrackOrder, initialTab }) => {
    const { logout, updateUser, deleteAccount } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DELIVERIES' | 'FLEET' | 'BULK' | 'ADDRESSES' | 'API' | 'PROFILE'>('OVERVIEW');
    const [bulkInput, setBulkInput] = useState('');
    const [parsedBulkOrders, setParsedBulkOrders] = useState<Partial<DeliveryOrder>[]>([]);
    const [bulkStep, setBulkStep] = useState<'INPUT' | 'PREVIEW' | 'SUCCESS'>('INPUT');
    const [processingBulk, setProcessingBulk] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState<DeliveryOrder | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // API Tab State
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [docLanguage, setDocLanguage] = useState<'curl' | 'node' | 'python'>('curl');

    // Deliveries State
    const [businessOrders, setBusinessOrders] = useState<DeliveryOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [deliveryFilter, setDeliveryFilter] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ACTIVE');

    // Stats State
    const [stats, setStats] = useState({
        spend: 0,
        deliveries: 0,
        successRate: 0,
        activeOrders: 0
    });

    // Fleet State - Initialized with coordinates
    // We add 'pendingAction' property to track admin approval state locally
    const [fleet, setFleet] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

    // Confirmation & Admin Workflow State
    const [confirmDialog, setConfirmDialog] = useState<{ type: 'SWAP' | 'REMOVE', vehicle: any } | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'warning' } | null>(null);

    // Map State
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: APP_CONFIG.GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Fleet Request State
    const [isRequestingFleet, setIsRequestingFleet] = useState(false);
    const [newFleetType, setNewFleetType] = useState<VehicleType>(VehicleType.BODA);
    const [newFleetLocation, setNewFleetLocation] = useState('');
    const [fleetCount, setFleetCount] = useState<number>(1);
    const [fleetDescription, setFleetDescription] = useState('');

    // Mobile Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const markersRef = useRef<{ [key: string]: any }>({});

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        companyName: user?.companyName || '',
        kraPin: user?.kraPin || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        contactName: user?.name || ''
    });

    // Integrated Professional Settings States
    const [expandedSection, setExpandedSection] = useState<'SECURITY' | 'PRIVACY' | 'NOTIFICATIONS' | null>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isUpdating2FA, setIsUpdating2FA] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [showDeleteInput, setShowDeleteInput] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: true,
        push: true
    });
    const [loading, setLoading] = useState(false);

    // Address Book Data
    const [addresses, setAddresses] = useState<AddressBookEntry[]>([]);

    const overviewData = {
        weeklySpend: [
            { label: 'Mon', value: 0, height: '0%' },
            { label: 'Tue', value: 0, height: '0%' },
            { label: 'Wed', value: 0, height: '0%' },
            { label: 'Thu', value: 0, height: '0%' },
            { label: 'Fri', value: 0, height: '0%' },
            { label: 'Sat', value: 0, height: '0%' },
            { label: 'Sun', value: 0, height: '0%' },
        ],
        vehicleUsage: [],
        recentActivity: []
    };

    useEffect(() => {
        if (initialTab) {
            if (['OVERVIEW', 'DELIVERIES', 'FLEET', 'BULK', 'ADDRESSES', 'API', 'PROFILE'].includes(initialTab)) {
                setActiveTab(initialTab as any);
            }
        }
    }, [initialTab]);

    useEffect(() => {
        if (activeTab === 'DELIVERIES' || activeTab === 'OVERVIEW') {
            fetchOrders();
            fetchMetrics();
        }
    }, [activeTab]);

    // Real-time Fleet Data from Firestore
    useEffect(() => {
        if (activeTab === 'FLEET' && user) {
            const q = query(collection(db, 'fleets'), where('ownerId', '==', user.id));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fleetData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                setFleet(fleetData.length > 0 ? fleetData.map(v => {
                    if (!v.lat || !v.lng) {
                        const [lat, lng] = resolveCoords(v.location);
                        return { ...v, lat, lng };
                    }
                    return v;
                }) : []);
            });

            return () => unsubscribe();
        }
    }, [activeTab, user]);

    // Focus Map
    useEffect(() => {
        if (activeTab === 'FLEET' && selectedVehicle && map) {
            map.panTo({ lat: selectedVehicle.lat, lng: selectedVehicle.lng });
            map.setZoom(15);
        }
    }, [selectedVehicle, activeTab, map]);

    const fetchMetrics = async () => {
        if (!user) return;
        const m = await orderService.getBusinessMetrics(user.id);
        setStats(m);
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const orders = await orderService.getUserOrders(user.id);
            setBusinessOrders(orders);
        } catch (error) {
            console.error("Failed to load business orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    // ... (Bulk handlers) ...
    const handleParseBulk = () => {
        if (!bulkInput.trim()) return;
        const lines = bulkInput.split('\n').filter(line => line.trim() !== '');
        const parsed: Partial<DeliveryOrder>[] = [];

        lines.forEach((line) => {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length >= 3) {
                parsed.push({
                    pickup: parts[0],
                    dropoff: parts[1],
                    items: { description: parts[2], weightKg: 1, fragile: false, value: 0 },
                    pickupTime: parts[3] || 'ASAP',
                    price: 250
                });
            }
        });

        if (parsed.length > 0) {
            setParsedBulkOrders(parsed);
            setBulkStep('PREVIEW');
        }
    };

    const handleConfirmBulk = async () => {
        setProcessingBulk(true);
        setTimeout(async () => {
            for (const pOrder of parsedBulkOrders) {
                const orderData: Omit<DeliveryOrder, 'id' | 'verificationCode'> = {
                    userId: user.id,
                    pickup: pOrder.pickup!,
                    dropoff: pOrder.dropoff!,
                    vehicle: VehicleType.BODA,
                    items: pOrder.items!,
                    pickupTime: pOrder.pickupTime,
                    price: pOrder.price!,
                    status: 'pending',
                    estimatedDuration: '45 mins',
                    date: new Date().toISOString(),
                    sender: { name: user.companyName || user.name, phone: user.phone || '' },
                    recipient: { name: 'Customer', phone: '' },
                    paymentMethod: 'CORPORATE_INVOICE',
                    serviceType: ServiceType.STANDARD
                };
                await orderService.createOrder(orderData);
            }
            setProcessingBulk(false);
            setBulkStep('SUCCESS');
            setBulkInput('');
        }, 2000);
    };

    const handleSaveProfile = async () => {
        try {
            await updateUser({ ...profileForm, name: profileForm.contactName });
            setIsEditingProfile(false);
            setNotification({ message: 'Profile updated successfully', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Failed to update profile', type: 'warning' });
        }
    };

    const handleToggle2FA = async () => {
        setIsUpdating2FA(true);
        // Simulate API call to update MFA settings
        setTimeout(() => {
            setIs2FAEnabled(!is2FAEnabled);
            setIsUpdating2FA(false);
            setNotification({
                message: `Two-Factor Authentication ${!is2FAEnabled ? 'enabled' : 'disabled'}`,
                type: 'success'
            });
        }, 1000);
    };

    const handlePasswordUpdate = () => {
        if (!passwords.new || passwords.new !== passwords.confirm) {
            setNotification({ message: 'Passwords do not match or are empty', type: 'warning' });
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowPasswordFields(false);
            setPasswords({ current: '', new: '', confirm: '' });
            setNotification({ message: 'Security password updated successfully', type: 'success' });
        }, 1500);
    };

    const handleDeactivateAccount = () => {
        if (window.confirm('Are you sure you want to go offline? You can reactivate by logging in again.')) {
            setNotification({ message: 'Business account deactivated. Redirecting...', type: 'info' });
            setTimeout(() => logout(), 2000);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') return;
        try {
            setLoading(true);
            await deleteAccount();
            onGoHome();
        } catch (error: any) {
            console.error('Delete account error:', error);
            setNotification({
                message: error.code === 'auth/requires-recent-login'
                    ? 'Please log out and back in to delete your account'
                    : 'Failed to delete account',
                type: 'warning'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            toast.success('Account deleted successfully');
            onGoHome();
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

    // --- NEW: Admin Approval Logic ---

    const initiateSwap = (vehicle: any) => {
        setConfirmDialog({ type: 'SWAP', vehicle });
    };

    const initiateRemove = (vehicle: any) => {
        setConfirmDialog({ type: 'REMOVE', vehicle });
    };

    const handleConfirmActionRequest = () => {
        if (!confirmDialog) return;
        const { type, vehicle } = confirmDialog;

        // 1. Close Modal
        setConfirmDialog(null);

        // 2. Set vehicle to Pending state locally
        setFleet(prev => prev.map(v => v.id === vehicle.id ? { ...v, pendingAction: type } : v));

        // Update selected vehicle reference to reflect pending status immediately if selected
        if (selectedVehicle?.id === vehicle.id) {
            setSelectedVehicle((prev: any) => ({ ...prev, pendingAction: type }));
        }

        // 3. Show "Request Sent" Notification
        setNotification({ message: `Request to ${type.toLowerCase()} vehicle sent to Admin for approval.`, type: 'info' });
        setTimeout(() => setNotification(null), 4000);

        // 4. Simulate Admin Approval Process (5 Seconds)
        setTimeout(() => {
            if (type === 'SWAP') {
                performSwap(vehicle.id);
            } else {
                performRemove(vehicle.id);
            }
        }, 5000);
    };

    const performSwap = (vehicleId: string) => {
        setFleet(prev => prev.map(v => {
            if (v.id === vehicleId) {
                return {
                    ...v,
                    name: 'Swapped Driver',
                    phone: '0700 000 000',
                    plate: 'NEW 001Z',
                    battery: 100,
                    status: 'ACTIVE',
                    pendingAction: null // Clear pending
                };
            }
            return v;
        }));

        if (selectedVehicle?.id === vehicleId) {
            setSelectedVehicle((prev: any) => prev ? ({ ...prev, name: 'Swapped Driver', plate: 'NEW 001Z', pendingAction: null }) : null);
        }

        setNotification({ message: "Admin Approved: Vehicle swap completed successfully.", type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };

    const performRemove = (vehicleId: string) => {
        setFleet(prev => prev.filter(v => v.id !== vehicleId));
        if (selectedVehicle?.id === vehicleId) setSelectedVehicle(null);

        if (markersRef.current[vehicleId]) {
            markersRef.current[vehicleId].remove();
            delete markersRef.current[vehicleId];
        }

        setNotification({ message: "Admin Approved: Vehicle removed from fleet.", type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };

    // --- End Admin Approval Logic ---

    const handleAddFleet = async () => {
        setIsRequestingFleet(true);
        const count = Math.max(1, fleetCount);

        try {
            for (let i = 0; i < count; i++) {
                const [lat, lng] = resolveCoords(newFleetLocation || 'Westlands');
                const newVehicle = {
                    ownerId: user.id,
                    name: i === 0 ? 'Pending Assignment' : `Pending Assignment ${i + 1}`,
                    phone: 'Waiting...',
                    vehicle: newFleetType,
                    plate: 'TBD',
                    status: 'IDLE',
                    location: newFleetLocation || 'HQ',
                    battery: 100,
                    lastPing: 'Just now',
                    lat,
                    lng,
                    timestamp: new Date().toISOString()
                };

                await addDoc(collection(db, 'fleets'), newVehicle);
            }
            // No need to manually setFleet, onSnapshot will pick it up
            setNotification({ message: `${count} vehicle(s) added to fleet successfully.`, type: 'success' });
        } catch (error) {
            console.error("Error adding fleet:", error);
            setNotification({ message: "Failed to add vehicle. Try again.", type: 'warning' });
        } finally {
            setIsRequestingFleet(false);
            setNewFleetLocation('');
            setFleetCount(1);
            setFleetDescription('');
        }
    };

    const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === id ? 'bg-brand-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'}`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </button>
    );

    const getFilteredOrders = () => {
        if (deliveryFilter === 'ACTIVE') {
            return businessOrders.filter(o => ['pending', 'driver_assigned', 'in_transit'].includes(o.status));
        }
        if (deliveryFilter === 'HISTORY') {
            return businessOrders.filter(o => ['delivered', 'cancelled'].includes(o.status));
        }
        return businessOrders;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative">
            {/* ... (Previous components: Toast, Dialog, Header, Sidebar) ... */}
            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center border animate-in slide-in-from-top-2 duration-300 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-brand-50 text-brand-700 border-brand-100'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <Clock className="w-5 h-5 mr-3 animate-pulse" />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDialog(null)}></div>
                    <div className="relative bg-white border border-gray-100 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Request Admin Approval?</h3>
                        <p className="text-center text-gray-500 text-sm mb-6">
                            You are requesting to <strong>{confirmDialog.type.toLowerCase()}</strong> the vehicle <span className="font-semibold text-gray-700">{confirmDialog.vehicle.name}</span>.
                            This request will be sent to an admin for approval before completion.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmActionRequest}
                                className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20"
                            >
                                Confirm Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center lg:hidden sticky top-0 z-30">
                <span className="text-lg font-bold">Tuma<span className="text-brand-600">Business</span></span>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 text-gray-900 flex flex-col 
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:fixed lg:h-full
      `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <span className="text-lg font-bold">Tuma<span className="text-brand-600">Business</span></span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-y-auto pt-4">
                    <button
                        onClick={onGoHome}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all mb-1 text-gray-600 hover:bg-gray-50 hover:text-brand-600 font-medium"
                    >
                        <Home className="w-5 h-5 text-gray-400" />
                        <span>Back to Home</span>
                    </button>
                    <div className="h-px bg-gray-100 my-2 mx-4"></div>
                    <SidebarItem id="OVERVIEW" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem id="DELIVERIES" icon={Package} label="Deliveries" />
                    <SidebarItem id="FLEET" icon={Truck} label="Fleet Management" />
                    <SidebarItem id="BULK" icon={Upload} label="Bulk Schedule" />
                    <SidebarItem id="ADDRESSES" icon={Building} label="Address Book" />
                    <SidebarItem id="API" icon={Terminal} label="API & Integration" />
                    <SidebarItem id="PROFILE" icon={UserIcon} label="Business Profile" />
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center font-bold text-brand-600 border border-brand-100">
                            {user.companyName ? user.companyName.charAt(0) : 'B'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-gray-900">{user.companyName || 'Business Inc.'}</p>
                            <p className="text-xs text-gray-500 truncate">Enterprise Plan</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={onGoHome}
                            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Back to Site</span>
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center space-x-2 text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 lg:ml-64 p-4 sm:p-8 w-full overflow-hidden">

                {/* ... (Previous tabs content: OVERVIEW, DELIVERIES, FLEET, BULK, ADDRESSES) ... */}
                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                        {/* ... Overview Content ... */}
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-500">Welcome back, {user.name}</p>
                            </div>
                            <button
                                onClick={onNewRequest}
                                className="w-full sm:w-auto bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center shadow-sm hover:bg-brand-700"
                            >
                                <Plus className="w-4 h-4 mr-2" /> New Request
                            </button>
                        </header>

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* ... Cards ... */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-brand-50 p-3 rounded-lg text-brand-600"><BarChart3 className="w-6 h-6" /></div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">KES {stats.spend.toLocaleString()}</h3>
                                <p className="text-sm text-gray-500">Total Spend (Month)</p>
                            </div>
                            {/* ... other stats ... */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600"><Package className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.deliveries}</h3>
                                <p className="text-sm text-gray-500">Deliveries Completed</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><Activity className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.activeOrders}</h3>
                                <p className="text-sm text-gray-500">Active Orders</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600"><CheckCircle2 className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.successRate}%</h3>
                                <p className="text-sm text-gray-500">Success Rate</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-gray-900">Recent Activity</h3>
                                    <button onClick={() => setActiveTab('DELIVERIES')} className="text-brand-600 text-sm font-bold hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {businessOrders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600'}`}>
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-bold text-gray-900">{order.dropoff}</p>
                                                        <button
                                                            onClick={() => handleCopyId(order.id)}
                                                            className="flex items-center space-x-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-all"
                                                            title="Copy Order ID"
                                                        >
                                                            <span>{order.id}</span>
                                                            {copiedId === order.id ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(order.createdAt || order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        {order.updatedAt && order.updatedAt !== (order.createdAt || order.date) && (
                                                            <span className="ml-2 text-brand-600 font-medium">
                                                                (Edited: {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                            </span>
                                                        )}
                                                        <span className="mx-2">•</span>
                                                        {order.items.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600'}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                    {businessOrders.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            No recent activity.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-lg text-gray-900 mb-6">Driver Feedback</h3>
                                <div className="space-y-4">
                                    {stats.recentReviews && stats.recentReviews.length > 0 ? (
                                        stats.recentReviews.map((review: any) => (
                                            <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-900">{review.driverName}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-gray-600 italic line-clamp-2">"{review.comment}"</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            No feedback yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-gray-400" /> Weekly Spend
                                    </h3>
                                    <button className="text-xs font-bold text-brand-600 hover:underline">View Report</button>
                                </div>
                                <div className="h-64 flex items-end justify-between gap-2 px-2">
                                    {overviewData.weeklySpend.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                                            <div className="w-full bg-gray-50 rounded-t-lg relative group-hover:bg-gray-100 transition-colors" style={{ height: day.height }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    KES {day.value.toLocaleString()}
                                                </div>
                                                <div className="w-full h-full bg-brand-600/80 rounded-t-lg"></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">{day.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                                    <PieChart className="w-5 h-5 mr-2 text-gray-400" /> Fleet Usage
                                </h3>
                                <div className="space-y-5">
                                    {overviewData.vehicleUsage.map((v, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-600">{v.type}</span>
                                                <span className="font-bold text-gray-900">{v.pct}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full ${v.color}`} style={{ width: v.pct }}></div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{v.count} deliveries</p>
                                        </div>
                                    ))}
                                </div>
                                {/* ... */}
                            </div>
                        </div>
                    </div>
                )
                }

                {/* ... (Other Tabs like DELIVERIES, FLEET, BULK, ADDRESSES need to be here as well, using existing logic) ... */}
                {
                    activeTab === 'DELIVERIES' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* ... Deliveries Content ... */}
                            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                                {/* ... */}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
                                    <p className="text-gray-500">Track ongoing shipments and view history.</p>
                                </div>
                                <div className="flex bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                                    <button onClick={() => setDeliveryFilter('ACTIVE')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${deliveryFilter === 'ACTIVE' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Ongoing</button>
                                    <button onClick={() => setDeliveryFilter('HISTORY')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${deliveryFilter === 'HISTORY' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Delivered</button>
                                </div>
                            </div>
                            {loadingOrders ? (
                                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-100 border-t-brand-600 rounded-full animate-spin"></div></div>
                            ) : getFilteredOrders().length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No deliveries found</h3>
                                    <p className="text-gray-500">You don't have any {deliveryFilter.toLowerCase()} orders.</p>
                                    <button onClick={onNewRequest} className="mt-4 text-brand-600 font-bold hover:underline">Create a Request</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {getFilteredOrders().map((order) => (
                                        <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:border-brand-100 transition-all">
                                            {/* ... Order Card ... */}
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <button
                                                            onClick={() => handleCopyId(order.id)}
                                                            className="flex items-center space-x-2 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded font-mono text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-all"
                                                            title="Click to copy Order ID"
                                                        >
                                                            <span>{order.id}</span>
                                                            {copiedId === order.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>{order.status.replace('_', ' ')}</span>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900 flex items-center">
                                                        {order.items.description}
                                                        {order.status !== 'delivered' && (
                                                            <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-100">
                                                                <Shield className="w-2.5 h-2.5 mr-1" />
                                                                Code: {order.verificationCode}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(order.createdAt || order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        {order.updatedAt && order.updatedAt !== (order.createdAt || order.date) && (
                                                            <span className="ml-2 text-brand-600 font-bold">
                                                                (Edited: {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                            </span>
                                                        )}
                                                        <span className="mx-2">•</span>
                                                        {order.vehicle}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <p className="font-bold text-lg text-gray-900">KES {order.price.toLocaleString()}</p>
                                                    {['pending', 'driver_assigned', 'in_transit'].includes(order.status) && (
                                                        <button onClick={() => onTrackOrder(order.id)} className="mt-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-700 transition-colors">Track Order <ChevronRight className="w-4 h-4 ml-1" /></button>
                                                    )}
                                                    {order.status === 'delivered' && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => setViewingReceipt(order)}
                                                                className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-brand-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                <FileText className="w-3 h-3 mr-1.5" /> Receipt
                                                            </button>
                                                            <button
                                                                onClick={() => onNewRequest({
                                                                    pickup: order.pickup,
                                                                    dropoff: order.dropoff,
                                                                    pickupCoords: order.pickupCoords,
                                                                    dropoffCoords: order.dropoffCoords,
                                                                    vehicle: order.vehicle,
                                                                    serviceType: order.serviceType,
                                                                    itemDescription: order.itemDescription || (order.items as any)?.description,
                                                                    sender: order.sender,
                                                                    recipient: order.recipient,
                                                                    stops: order.stops,
                                                                    price: order.price,
                                                                    isReorder: true
                                                                })}
                                                                className="flex items-center text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-white hover:bg-brand-600 border border-brand-100 px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                <RefreshCw className="w-3 h-3 mr-1.5" /> Reorder
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* ... Pickup/Dropoff ... */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-start">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></div>
                                                    <div><p className="text-xs font-bold text-gray-400 uppercase">Pickup</p><p className="text-sm font-medium text-gray-700">{order.pickup}</p></div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                                                    <div><p className="text-xs font-bold text-gray-400 uppercase">Dropoff</p><p className="text-sm font-medium text-gray-700">{order.dropoff}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }

                {/* ... Fleet, Bulk, Addresses tabs logic must be preserved ... */}
                {
                    activeTab === 'FLEET' && (
                        // ... Existing Fleet Logic ...
                        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col min-h-screen">
                            {/* ... Fleet UI ... */}
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
                                    <p className="text-gray-500">Monitor and manage your assigned vehicles.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-500 shadow-sm">Total: {fleet.length}</div>
                                    <button onClick={() => setIsRequestingFleet(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center transition-colors"><Plus className="w-4 h-4 mr-1.5" /> Request Vehicle</button>
                                </div>
                            </div>
                            {/* ... (Rest of Fleet Logic including Map & Modals) ... */}
                            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                                {/* ... List ... */}
                                <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-[320px] max-h-[320px]">
                                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-600 text-sm">Active Fleet</h3>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" /><input className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 placeholder:text-gray-400" placeholder="Filter by driver or plate..." />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-x-auto p-4 flex space-x-6 items-start">
                                        {fleet.map(vehicle => {
                                            const Icon = getVehicleIcon(vehicle.vehicle);
                                            return (
                                                <div key={vehicle.id} className={`relative flex-shrink-0 w-80 border rounded-2xl p-5 transition-all cursor-pointer hover:shadow-lg ${selectedVehicle?.id === vehicle.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/10' : 'border-gray-100 bg-white'}`} onClick={() => setSelectedVehicle(vehicle)}>
                                                    {/* Card Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-base">{vehicle.name}</h4>
                                                            <div className="flex items-center mt-1 space-x-2">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{vehicle.plate}</span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{vehicle.vehicle}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${vehicle.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : vehicle.status === 'IDLE' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                            {vehicle.status}
                                                        </span>
                                                    </div>

                                                    {/* Metrics Row */}
                                                    <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-gray-100">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                                                                <Battery className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Battery</p>
                                                                <p className="text-xs font-bold text-gray-700">{vehicle.battery}%</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                                                                <Navigation className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Last Loc</p>
                                                                <p className="text-xs font-bold text-gray-700 truncate max-w-[70px]">{vehicle.location}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card Footer */}
                                                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-4">
                                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {vehicle.lastPing}</span>
                                                        <span className="flex items-center text-brand-600 font-bold"><Activity className="w-3 h-3 mr-1" /> View History</span>
                                                    </div>

                                                    {/* Pending & Actions Layer */}
                                                    {vehicle.pendingAction && (
                                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl text-center p-6 border-2 border-brand-100">
                                                            <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-3 animate-pulse">
                                                                <Clock className="w-6 h-6 text-brand-600" />
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-tight">Updating Fleet</p>
                                                            <p className="text-[10px] text-gray-500">Request to {vehicle.pendingAction.toLowerCase()} sent to admin.</p>
                                                        </div>
                                                    )}

                                                    {!vehicle.pendingAction && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); initiateSwap(vehicle); }}
                                                                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 text-xs font-bold transition-all shadow-md shadow-brand-500/20"
                                                            >
                                                                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Swap
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); initiateRemove(vehicle); }}
                                                                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-white border border-red-100 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                {/* ... Map Container ... */}
                                <div className="flex-1 flex gap-4 h-full relative overflow-hidden min-h-0">
                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 relative overflow-hidden shadow-inner group min-h-[500px]">
                                        {isLoaded ? (
                                            <GoogleMap
                                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                                center={selectedVehicle ? { lat: selectedVehicle.lat, lng: selectedVehicle.lng } : { lat: -1.2921, lng: 36.8219 }}
                                                zoom={12}
                                                onLoad={setMap}
                                                onUnmount={() => setMap(null)}
                                                options={{
                                                    disableDefaultUI: true,
                                                    styles: [
                                                        {
                                                            "featureType": "poi",
                                                            "elementType": "labels",
                                                            "stylers": [{ "visibility": "off" }]
                                                        }
                                                    ]
                                                }}
                                            >
                                                {fleet.filter(v => v.status !== 'OFFLINE').map(v => (
                                                    <OverlayView
                                                        key={v.id}
                                                        position={{ lat: v.lat, lng: v.lng }}
                                                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                                    >
                                                        <div
                                                            onClick={() => setSelectedVehicle(v)}
                                                            className={`w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer -translate-x-1/2 -translate-y-1/2 ${v.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                                        />
                                                    </OverlayView>
                                                ))}
                                            </GoogleMap>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                <Truck className="w-10 h-10 text-brand-600 animate-bounce" />
                                            </div>
                                        )}
                                        {/* ... Legend & Details Panel ... */}
                                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-3 rounded-lg text-xs shadow-lg border border-gray-200 z-[400]">
                                            <div className="font-bold text-slate-700 mb-2">Map Legend</div>
                                            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div><span className="text-slate-600">Active</span></div>
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm"></div><span className="text-slate-600">Idle</span></div>
                                        </div>
                                        {selectedVehicle && (
                                            <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[500] animate-in slide-in-from-right fade-in duration-300 overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center"><h4 className="font-bold text-slate-800 text-sm">Vehicle Details</h4><button onClick={() => setSelectedVehicle(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
                                                <div className="p-5 relative">
                                                    {selectedVehicle.pendingAction && (<div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6"><div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 animate-pulse"><Clock className="w-6 h-6 text-blue-600" /></div><h4 className="font-bold text-gray-900">Approval Pending</h4><p className="text-sm text-gray-500 mt-1">We are processing your request to {selectedVehicle.pendingAction.toLowerCase()} this vehicle.</p></div>)}
                                                    {/* ... Vehicle Details Content ... */}
                                                    <div className="flex justify-between items-start mb-4"><div><h3 className="text-lg font-bold text-slate-900">{selectedVehicle.name}</h3><p className="text-sm text-slate-500">{selectedVehicle.plate} • {selectedVehicle.vehicle}</p></div><div className="flex gap-2"><button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600" title="Call"><Phone className="w-4 h-4" /></button><button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600" title="Message"><Mail className="w-4 h-4" /></button></div></div>
                                                    <div className="grid grid-cols-2 gap-3 mb-6"><div className="bg-slate-50 p-3 rounded-lg text-center"><Battery className="w-5 h-5 mx-auto mb-1 text-green-600" /><span className="text-xs font-bold text-slate-700">{selectedVehicle.battery}% Battery</span></div><div className="bg-slate-50 p-3 rounded-lg text-center"><Navigation className="w-5 h-5 mx-auto mb-1 text-blue-600" /><span className="text-xs font-bold text-slate-700">0 Trips Today</span></div></div>
                                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mb-4 border border-gray-100"><span className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Location</span><span className="text-xs font-bold text-slate-700">{selectedVehicle.location}</span></div>
                                                    <div className="space-y-2"><button onClick={() => initiateSwap(selectedVehicle)} disabled={!!selectedVehicle.pendingAction} className="w-full bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"><RefreshCw className="w-4 h-4 mr-2" /> Swap Driver</button><button onClick={() => initiateRemove(selectedVehicle)} disabled={!!selectedVehicle.pendingAction} className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4 mr-2" /> Remove Vehicle</button></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* ... Modals for Fleet ... */}
                            {isRequestingFleet && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsRequestingFleet(false)}></div>
                                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                                        {/* ... Fleet Request Form ... */}
                                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900">Request Fleet Vehicle</h3><button onClick={() => setIsRequestingFleet(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button></div>
                                        <div className="space-y-4">
                                            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Vehicle Type</label><div className="grid grid-cols-2 gap-2">{Object.values(VehicleType).map((v) => { const Icon = getVehicleIcon(v); return (<button key={v} onClick={() => setNewFleetType(v)} className={`p-3 rounded-xl border text-sm font-medium text-left flex flex-col justify-between h-20 transition-all ${newFleetType === v ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50 text-gray-600 bg-white'}`}><Icon className={`w-5 h-5 ${newFleetType === v ? 'text-blue-600' : 'text-gray-400'}`} />{v}</button>) })}</div></div>
                                            <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Quantity</label><div className="relative"><Hash className="absolute left-3 top-3 text-gray-400 w-5 h-5" /><input type="number" min="1" value={fleetCount} onChange={(e) => setFleetCount(parseInt(e.target.value) || 1)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div></div><div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Station Location</label><div className="relative"><MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" /><input value={newFleetLocation} onChange={(e) => setNewFleetLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="e.g. Westlands" /></div></div></div>
                                            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Operation Details</label><div className="relative"><AlignLeft className="absolute left-3 top-3 text-gray-400 w-5 h-5" /><textarea value={fleetDescription} onChange={(e) => setFleetDescription(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white min-h-[80px]" placeholder="Describe the nature of goods, delivery hours, or any special requirements..." /></div></div>
                                            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm"><div className="flex-shrink-0 mt-0.5"><AlertCircle className="w-5 h-5" /></div><p>We will assign {fleetCount} {newFleetType}{fleetCount > 1 ? 's' : ''} to your fleet within 24 hours based on your requirements.</p></div>
                                            <div className="flex gap-3 pt-2"><button onClick={() => setIsRequestingFleet(false)} className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white">Cancel</button><button onClick={handleAddFleet} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">Submit Request</button></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* ... Bulk, Addresses, Profile logic preserved ... */}
                {/* BULK TAB */}
                {
                    activeTab === 'BULK' && (
                        // ... Bulk content ...
                        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
                            <div><h1 className="text-2xl font-bold text-gray-900">Bulk Schedule</h1><p className="text-gray-500">Upload multiple deliveries at once. Perfect for e-commerce dispatch.</p></div>
                            <div className="flex items-center space-x-4 text-sm font-bold border-b border-gray-100 pb-4"><span className={`flex items-center ${bulkStep === 'INPUT' ? 'text-brand-600' : 'text-gray-400'}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${bulkStep === 'INPUT' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>1</div>Input Data</span><ChevronRight className="w-4 h-4 text-gray-300" /><span className={`flex items-center ${bulkStep === 'PREVIEW' ? 'text-brand-600' : 'text-gray-400'}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${bulkStep === 'PREVIEW' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>2</div>Review & Confirm</span><ChevronRight className="w-4 h-4 text-gray-300" /><span className={`flex items-center ${bulkStep === 'SUCCESS' ? 'text-emerald-600' : 'text-gray-400'}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${bulkStep === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>3</div>Scheduled</span></div>
                            {bulkStep === 'INPUT' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="space-y-4"><div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><label className="block text-sm font-bold text-gray-700 mb-2">Paste Orders (CSV format or Pipe separated)</label><p className="text-xs text-gray-400 mb-3">Format: <code className="bg-gray-50 px-1 py-0.5 rounded text-gray-600">Pickup | Dropoff | Item Description | Time(Optional)</code></p><textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} className="w-full h-64 p-4 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-white text-gray-900 placeholder:text-gray-300" placeholder={`Westlands | CBD | 2 Boxes of Files\nKileleshwa | Karen | Birthday Cake | 14:00\nRoysambu | Thika | Car Spare Parts`} /><div className="flex justify-end mt-4"><button onClick={handleParseBulk} disabled={!bulkInput.trim()} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 flex items-center transition-colors"><ArrowRight className="w-4 h-4 mr-2" /> Process Data</button></div></div></div><div className="space-y-4"><div className="bg-brand-50 border border-brand-100 p-6 rounded-xl"><h3 className="font-bold text-brand-600 mb-2 flex items-center"><Terminal className="w-5 h-5 mr-2" /> Quick Guide</h3><ul className="space-y-2 text-sm text-gray-600 list-disc list-inside"><li>Use the pipe character <b>|</b> to separate fields.</li><li>Pickup and Dropoff are required.</li><li>Item description helps us assign the right vehicle.</li><li>Time is optional (defaults to ASAP).</li></ul></div><div className="bg-white p-6 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-12 cursor-pointer hover:bg-gray-50 transition-colors"><Upload className="w-10 h-10 text-gray-300 mb-3" /><p className="text-sm font-bold text-gray-600">Upload CSV File</p><p className="text-xs text-gray-400 mt-1">Drag and drop or click to browse</p></div></div></div>)}
                            {bulkStep === 'PREVIEW' && (<div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-600">Review Orders ({parsedBulkOrders.length})</h3><button onClick={() => setBulkStep('INPUT')} className="text-sm text-gray-400 hover:text-gray-600">Edit Data</button></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-3">Pickup</th><th className="px-6 py-3">Dropoff</th><th className="px-6 py-3">Item</th><th className="px-6 py-3">Time</th><th className="px-6 py-3">Est. Cost</th></tr></thead><tbody className="divide-y divide-gray-50">{parsedBulkOrders.map((order, idx) => (<tr key={idx} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium text-gray-900">{order.pickup}</td><td className="px-6 py-4 text-gray-600">{order.dropoff}</td><td className="px-6 py-4 text-gray-600">{order.items?.description}</td><td className="px-6 py-4 text-gray-600">{order.pickupTime || 'ASAP'}</td><td className="px-6 py-4 font-bold text-gray-900">KES {(order.price || 0).toLocaleString()}</td></tr>))}
                            </tbody></table></div><div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end"><button onClick={handleConfirmBulk} disabled={processingBulk} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center shadow-lg shadow-emerald-500/20 transition-colors">{processingBulk ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Processing...</>) : (<><CheckCircle2 className="w-5 h-5 mr-2" /> Confirm & Schedule All</>)}</button></div></div>)}
                            {bulkStep === 'SUCCESS' && (<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center max-w-2xl mx-auto"><div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div><h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Scheduled Successfully!</h2><p className="text-gray-500 mb-8">{parsedBulkOrders.length} deliveries have been added to your queue. Drivers will be assigned shortly.</p><div className="flex justify-center gap-4"><button onClick={() => { setParsedBulkOrders([]); setBulkStep('INPUT'); }} className="px-6 py-2 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">Upload More</button><button onClick={() => setActiveTab('DELIVERIES')} className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-md transition-colors">View Deliveries</button></div></div>)}
                        </div>
                    )
                }

                {/* ADDRESSES TAB */}
                {
                    activeTab === 'ADDRESSES' && (
                        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
                            <div className="flex justify-between items-end"><div><h1 className="text-2xl font-bold text-gray-900">Address Book</h1><p className="text-gray-500">Manage your frequent pickup and dropoff locations.</p></div><button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 flex items-center transition-colors"><Plus className="w-4 h-4 mr-2" /> Add New</button></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start group hover:border-brand-200 transition-all"><div><div className="flex items-center gap-2 mb-2"><Building className="w-4 h-4 text-brand-600" /><h3 className="font-bold text-gray-900">{addr.label}</h3></div><p className="text-gray-600 text-sm mb-3 flex items-start"><MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-gray-400" />{addr.address}</p><div className="text-xs text-gray-500 bg-gray-50 p-2 rounded inline-block"><span className="font-bold text-gray-700">{addr.contactName}</span> • {addr.contactPhone}</div></div><button className="text-gray-300 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button></div>
                                ))}
                                <button className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all min-h-[160px] bg-white"><Plus className="w-8 h-8 mb-2" /><span className="font-bold text-sm">Add Address</span></button>
                            </div>
                        </div>
                    )
                }

                {/* API TAB - UPGRADED */}
                {
                    activeTab === 'API' && (
                        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">API & Integration</h1>
                                <p className="text-gray-500">Connect your store or app to TumaFast's logistics network.</p>
                            </div>

                            {/* API Keys Section */}
                            <div className="bg-white rounded-2xl p-8 text-gray-900 shadow-xl relative overflow-hidden border border-gray-100">
                                <div className="absolute top-0 right-0 p-32 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                                                <Server className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold">Live API Credentials</h3>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">Roll Key</button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block tracking-wider">Publishable Key</label>
                                            <div className="flex items-center space-x-2">
                                                <code className="flex-1 bg-gray-50 p-3.5 rounded-xl border border-gray-200 font-mono text-brand-600 text-sm">
                                                    pk_live_51Mz928sL92...x92
                                                </code>
                                                <button className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors border border-gray-200">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block tracking-wider">Secret Key</label>
                                            <div className="flex items-center space-x-2">
                                                <code className="flex-1 bg-gray-50 p-3.5 rounded-xl border border-gray-200 font-mono text-amber-600 text-sm flex items-center">
                                                    {showSecretKey ? 'sk_live_51Mz928sL92...x928sL92_SECRET' : '••••••••••••••••••••••••••••••••'}
                                                </code>
                                                <button
                                                    onClick={() => setShowSecretKey(!showSecretKey)}
                                                    className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors border border-gray-200"
                                                >
                                                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors border border-gray-200">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1.5" /> Keep this key secret. Never share it in client-side code.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Start Documentation */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Code className="w-5 h-5 text-gray-400" />
                                        <h3 className="font-bold text-gray-900">Quick Start</h3>
                                    </div>
                                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 shadow-sm">
                                        <button onClick={() => setDocLanguage('curl')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${docLanguage === 'curl' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>cURL</button>
                                        <button onClick={() => setDocLanguage('node')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${docLanguage === 'node' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Node.js</button>
                                        <button onClick={() => setDocLanguage('python')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${docLanguage === 'python' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Python</button>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <pre className="bg-gray-900 text-brand-50 p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                                        {CODE_SNIPPETS[docLanguage]}
                                    </pre>
                                    <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                                    <a href="#" className="text-sm font-bold text-brand-600 hover:underline flex items-center">
                                        View Full Documentation <ArrowRight className="w-4 h-4 ml-1" />
                                    </a>
                                    <button className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                        <Play className="w-3 h-3 mr-1.5 fill-current" /> Run in Postman
                                    </button>
                                </div>
                            </div>

                            {/* Webhooks */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        <Globe className="w-5 h-5 mr-2 text-gray-400" /> Webhooks
                                    </h3>
                                    <button className="text-brand-600 text-sm font-bold flex items-center hover:underline">
                                        <Plus className="w-4 h-4 mr-1" /> Add Endpoint
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl gap-3 hover:border-brand-100 transition-colors group bg-gray-50">
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-1 bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">Order Status Updates</p>
                                                <p className="text-xs text-gray-500 break-all font-mono mt-1">https://api.your-server.com/webhooks/tumafast</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="bg-white text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">order.updated</span>
                                                    <span className="bg-white text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">delivery.completed</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Active
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* PROFILE TAB */}
                {
                    activeTab === 'PROFILE' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                            {/* New Professional Header */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-gradient-to-br from-brand-600 to-brand-800 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400/10 rounded-full -ml-24 -mb-24 blur-2xl" />

                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="relative group/avatar">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-white text-brand-600 flex items-center justify-center shadow-2xl transform group-hover/avatar:scale-105 transition-all duration-500 text-4xl font-black">
                                            {user.companyName ? user.companyName.charAt(0) : user.name?.charAt(0) || 'B'}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-xl border-4 border-white">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-4xl font-black tracking-tight">{user.companyName || user.name}</h2>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                                            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center">
                                                <Briefcase className="w-3.5 h-3.5 mr-2" /> Enterprise Partner
                                            </span>
                                            <span className="bg-emerald-400 text-emerald-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                                                <div className="w-2 h-2 bg-emerald-900 rounded-full mr-2 animate-pulse" /> Official Business
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative z-10 w-full md:w-auto">
                                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 text-center hover:bg-white/20 transition-all">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Company Size</span>
                                        <span className="text-2xl font-black">Enterprise</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 text-center hover:bg-white/20 transition-all">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status</span>
                                        <span className="text-2xl font-black">ACTIVE</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Company Details Card */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                                                    <Building className="w-5 h-5" />
                                                </div>
                                                Corporate Information
                                            </h3>
                                            <button
                                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                                className="px-5 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
                                            >
                                                {isEditingProfile ? <X className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                                                {isEditingProfile ? 'Cancel Edit' : 'Modify Details'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                                        <Briefcase className="w-3.5 h-3.5 mr-2" /> Registered Company Name
                                                    </label>
                                                    {isEditingProfile ? (
                                                        <input
                                                            value={profileForm.companyName}
                                                            onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-bold ml-5.5 text-lg">{user.companyName || 'N/A'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                                        <FileText className="w-3.5 h-3.5 mr-2" /> Tax Identification (KRA PIN)
                                                    </label>
                                                    {isEditingProfile ? (
                                                        <input
                                                            value={profileForm.kraPin}
                                                            onChange={(e) => setProfileForm({ ...profileForm, kraPin: e.target.value.toUpperCase() })}
                                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500/20 uppercase"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-black ml-5.5 text-lg tracking-widest bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-100">{user.kraPin || 'NOT PROVIDED'}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                                        <MapPin className="w-3.5 h-3.5 mr-2" /> Headquarters Address
                                                    </label>
                                                    {isEditingProfile ? (
                                                        <textarea
                                                            value={profileForm.address}
                                                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500/20 min-h-[100px]"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-bold ml-5.5 text-lg leading-relaxed">{user.address || 'No address provided'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Card */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-8">
                                        <h3 className="font-black text-slate-900 text-lg mb-8 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            Primary Contact Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                                    <UserIcon className="w-3.5 h-3.5 mr-2" /> Contact Person
                                                </label>
                                                {isEditingProfile ? (
                                                    <input
                                                        value={profileForm.contactName}
                                                        onChange={(e) => setProfileForm({ ...profileForm, contactName: e.target.value })}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-bold text-lg">{user.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                                    <Mail className="w-3.5 h-3.5 mr-2" /> Email Address
                                                </label>
                                                {isEditingProfile ? (
                                                    <input
                                                        value={profileForm.email}
                                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-bold text-lg break-all">{user.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone Number
                                                </label>
                                                {isEditingProfile ? (
                                                    <input
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-bold text-lg">{user.phone || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>

                                        {isEditingProfile && (
                                            <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end">
                                                <button
                                                    onClick={handleSaveProfile}
                                                    className="px-10 py-4 bg-brand-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand-200 hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-3"
                                                >
                                                    <Save className="w-4 h-4" /> Update Business Profile
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Professional Suite: Security & Privacy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`overflow-hidden border border-gray-50 rounded-[2.5rem] transition-all ${expandedSection === 'SECURITY' ? 'ring-2 ring-brand-500/20 bg-[#FBFCFE]' : 'bg-white shadow-sm'}`}>
                                        <button
                                            onClick={() => setExpandedSection(expandedSection === 'SECURITY' ? null : 'SECURITY')}
                                            className="w-full flex items-center justify-between p-8"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-black text-slate-900">Security Center</h3>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Corporate Access Control</p>
                                                </div>
                                            </div>
                                            {expandedSection === 'SECURITY' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                        </button>

                                        {expandedSection === 'SECURITY' && (
                                            <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                                <div className="space-y-4">
                                                    <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-brand-200 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                                                <QrCode className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 text-sm">Two-Factor Auth</h4>
                                                                <p className="text-[10px] text-gray-400 font-medium">Extra layer for invoice approvals</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={handleToggle2FA}
                                                            disabled={isUpdating2FA}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is2FAEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                            {isUpdating2FA && <RefreshCw className="absolute inset-0 m-auto w-3 h-3 text-white animate-spin" />}
                                                        </button>
                                                    </div>

                                                    <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-brand-200 transition-all" onClick={() => setShowPasswordFields(!showPasswordFields)}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                                <Key className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 text-sm">Update Password</h4>
                                                                <p className="text-[10px] text-gray-400 font-medium">Ensure account integrity</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-transform group-hover:translate-x-1" />
                                                    </div>

                                                    {showPasswordFields && (
                                                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <input
                                                                    type="password"
                                                                    placeholder="New Security Password"
                                                                    value={passwords.new}
                                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-brand-400"
                                                                />
                                                                <input
                                                                    type="password"
                                                                    placeholder="Confirm Password"
                                                                    value={passwords.confirm}
                                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-brand-400"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={handlePasswordUpdate}
                                                                disabled={loading}
                                                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                                                            >
                                                                {loading ? 'Processing...' : 'Secure Account'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`overflow-hidden border border-gray-50 rounded-[2.5rem] transition-all bg-white shadow-sm`}>
                                        <div className="p-8">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                                                    <Bell className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900">Notifications</h3>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Enterprise Alerts</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {[
                                                    { id: 'email', label: 'Invoices & Billing', icon: Mail },
                                                    { id: 'sms', label: 'Critical Status SMS', icon: Smartphone },
                                                    { id: 'push', label: 'Push Dashboard Alerts', icon: Navigation }
                                                ].map((notif) => (
                                                    <div key={notif.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <notif.icon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{notif.label}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setNotifications({ ...notifications, [notif.id]: !((notifications as any)[notif.id]) })}
                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${(notifications as any)[notif.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${(notifications as any)[notif.id] ? 'translate-x-[1.25rem]' : 'translate-x-[0.25rem]'}`} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] border border-gray-50 p-8 shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900">Privacy & Erasure</h3>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Account Status Control</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={handleDeactivateAccount}
                                                className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Power className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">Deactivate temporarily</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </button>

                                            {showDeleteInput ? (
                                                <div className="space-y-3 animate-in zoom-in-95">
                                                    <input
                                                        value={deleteConfirmation}
                                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                        placeholder='Type "DELETE" to proceed'
                                                        className="w-full px-4 py-3 bg-red-50 border-2 border-red-100 rounded-xl font-black text-center text-red-600 outline-none uppercase text-xs"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button onClick={() => setShowDeleteInput(false)} className="py-2.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                                                        <button disabled={deleteConfirmation !== 'DELETE'} onClick={handleDeleteAccount} className="py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50">Erase Everything</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowDeleteInput(true)}
                                                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                                                >
                                                    Terminate Business Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-8 right-8 z-[300] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : notification.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-bold">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Receipt Modal */}
            {viewingReceipt && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingReceipt(null)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden print:overflow-visible animate-in zoom-in-95 duration-200">
                        <div className="p-8 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible" id="receipt-content">
                            {/* Receipt Header */}
                            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                                <div>
                                    <h2 className="text-3xl font-black text-brand-600 tracking-tighter">TUMAFAST</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Official Delivery Receipt</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">Order ID: {viewingReceipt.id}</p>
                                    <p className="text-xs text-gray-500 font-medium">{new Date(viewingReceipt.date).toLocaleDateString('en-KE', { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sender Details</h4>
                                    <p className="text-sm font-bold text-gray-900">{viewingReceipt.sender.name}</p>
                                    <p className="text-xs text-gray-500">{viewingReceipt.sender.phone}</p>
                                    <div className="mt-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Address</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">{viewingReceipt.pickup}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recipient Details</h4>
                                    <p className="text-sm font-bold text-gray-900">{viewingReceipt.recipientName}</p>
                                    <p className="text-xs text-gray-500">{viewingReceipt.recipientPhone}</p>
                                    <div className="mt-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dropoff Address</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">{viewingReceipt.dropoff}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Order Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Service Type</span>
                                        <span className="font-bold text-gray-900 uppercase">{viewingReceipt.serviceType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Vehicle</span>
                                        <span className="font-bold text-gray-900 uppercase">{viewingReceipt.vehicle}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Item Description</span>
                                        <span className="font-bold text-gray-900">{viewingReceipt.itemDescription || (viewingReceipt.items as any)?.description}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-base font-black text-gray-900">Total Paid</span>
                                        <span className="text-2xl font-black text-brand-600">KES {viewingReceipt.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center border-t border-gray-100 pt-6">
                                <p className="text-[10px] text-gray-400 font-medium">Thank you for choosing Tumafast Kenya. This is a computer-generated receipt.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex gap-3 print:hidden">
                            <button
                                onClick={() => setViewingReceipt(null)}
                                className="flex-1 py-3 px-4 bg-white text-gray-600 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrintReceipt}
                                className="flex-1 py-3 px-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download / Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default BusinessDashboard;