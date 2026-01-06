import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles?: ('customer' | 'driver' | 'business')[];
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        // Redirect to home but maybe trigger login modal?
        // For now, redirect to home
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard or home
        if (user.role === 'driver') return <Navigate to="/driver" replace />;
        if (user.role === 'business') return <Navigate to="/business-dashboard" replace />;
        return <Navigate to="/customer-dashboard" replace />;
    }

    return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
