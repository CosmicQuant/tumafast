import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookingWizard from './booking/BookingWizardModular';
import { useAuth } from '../context/AuthContext';
import { useCreateOrder } from '../hooks/useOrders';
import type { DeliveryOrder } from '../types';
import { toast } from 'react-hot-toast';
import { useMapState } from '@/context/MapContext';
import LocationBlocker from './LocationBlocker';

interface BookingPageProps {
    prefillData?: any;
    onRequireAuth?: (title?: string, desc?: string) => void;
    onClearPrefill?: () => void;
    isDashboardMode?: boolean;
}

const BookingPageContent: React.FC<BookingPageProps> = ({ prefillData: propPrefill, onRequireAuth, onClearPrefill, isDashboardMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const createOrderMutation = useCreateOrder();

    // Redirect drivers away from booking page
    useEffect(() => {
        if (user?.role === 'driver') {
            toast.error("Driver accounts cannot place orders.");
            navigate('/driver');
        }
    }, [user, navigate]);

    const { setOrderState, setPickupCoords, setDropoffCoords, setWaypointCoords, setRoutePolyline, ensureFreshLocation } = useMapState();

    // Combine prop prefill with router state prefill
    const prefillData = propPrefill || location.state?.prefill;

    useEffect(() => {
        setOrderState('DRAFTING');
        ensureFreshLocation().catch(() => undefined);
        // Clear prefill immediately on mount to prevent redirect loops on mobile
        // The BookingForm has already initialized its state from the props
        onClearPrefill?.();

        return () => {
            setOrderState('IDLE');
            setPickupCoords(null);
            setDropoffCoords(null);
            setWaypointCoords([]);
            setRoutePolyline(null);
        };
    }, [ensureFreshLocation, setOrderState, onClearPrefill, setPickupCoords, setDropoffCoords, setWaypointCoords, setRoutePolyline]);

    const handleOrderComplete = async (order: DeliveryOrder) => {
        if (!user) {
            onRequireAuth?.('Authentication Required', 'Please log in or sign up to complete your booking.');
            return;
        }

        const orderWithUser = { ...order, userId: user.id };

        try {
            const newOrder = await createOrderMutation.mutateAsync(orderWithUser);

            toast.success('Order created successfully!');
            onClearPrefill?.();

            // Redirect everyone to tracking page as requested
            navigate(`/track/${newOrder.id}`);
        } catch (error) {
            console.error("Failed to create order", error);
            toast.error("Failed to create order. Please try again.");
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col pointer-events-none overflow-hidden">
            <LocationBlocker />
            {/* The form will be the drawer at the bottom */}
            <div className="relative z-10 flex-grow flex flex-col pointer-events-none">
                <BookingWizard
                    prefillData={prefillData}
                    onOrderComplete={handleOrderComplete}
                    onRequireAuth={onRequireAuth}
                    startAtDashboard={isDashboardMode}
                />
            </div>
        </div>
    );
};

const BookingPage: React.FC<BookingPageProps> = (props) => {
    return (
        <BookingPageContent {...props} />
    );
};

export default BookingPage;
