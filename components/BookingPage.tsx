import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookingForm from './BookingForm';
import HeroOverlay from './HeroOverlay';
import MapLayer from './MapLayer';
import { useAuth } from '../context/AuthContext';
import { useCreateOrder, useUserOrders } from '../hooks/useOrders';
import type { DeliveryOrder } from '../types';
import { toast } from 'react-hot-toast';
import { MapProvider, useMapState } from '@/context/MapContext';
import { ArrowLeft } from 'lucide-react';

interface BookingPageProps {
    prefillData?: any;
    onRequireAuth?: (data?: any) => void;
    onClearPrefill?: () => void;
}

const BookingPageContent: React.FC<BookingPageProps> = ({ prefillData: propPrefill, onRequireAuth, onClearPrefill }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const createOrderMutation = useCreateOrder();

    // Redirect drivers away from booking page
    useEffect(() => {
        if (user?.role === 'driver') {
            toast.error("Driver accounts cannot place orders.");
            navigate('/driver');
        }
    }, [user, navigate]);

    const { refetch: refetchOrders } = useUserOrders(user?.id || '');
    const { setOrderState, setPickupCoords, setDropoffCoords, setWaypointCoords, setRoutePolyline } = useMapState();
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Combine prop prefill with router state prefill
    const prefillData = propPrefill || location.state?.prefill;

    useEffect(() => {
        setOrderState('DRAFTING');
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
    }, [setOrderState, onClearPrefill, setPickupCoords, setDropoffCoords, setWaypointCoords, setRoutePolyline]);

    const handleOrderComplete = async (order: DeliveryOrder) => {
        if (!user) {
            toast.error("Authentication required to complete booking.");
            onRequireAuth?.(order);
            return;
        }

        const orderWithUser = { ...order, userId: user.id };

        try {
            const newOrder = await createOrderMutation.mutateAsync(orderWithUser);

            if (user?.role === 'business') {
                toast.success('Order created successfully!');
                onClearPrefill?.();
                navigate('/business-dashboard');
            } else {
                if (user) await refetchOrders();
                toast.success('Order created successfully!');
                onClearPrefill?.();
                navigate(`/tracking/${newOrder.id}`);
            }
        } catch (error) {
            console.error("Failed to create order", error);
            toast.error("Failed to create order. Please try again.");
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <MapLayer />
            </div>

            {/* The form will be the drawer at the bottom */}
            <div className="relative z-10 flex-grow flex flex-col pointer-events-none">
                <BookingForm
                    prefillData={prefillData}
                    onOrderComplete={handleOrderComplete}
                    onCollapseChange={setIsCollapsed}
                    onRequireAuth={onRequireAuth}
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
