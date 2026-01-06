import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { MapProvider } from '@/context/MapContext';
import Navbar from '@/components/Navbar';
import SideMenu from '@/components/SideMenu';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';
import ProfileModal from '@/components/ProfileModal';
import DebugSimulation from '@/components/DebugSimulation';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy-loaded components for performance (Code Splitting)
const Hero = lazy(() => import('@/components/Hero'));
const BookingPage = lazy(() => import('@/components/BookingPage'));
const TrackingPage = lazy(() => import('@/components/TrackingPage'));
const DriverDashboard = lazy(() => import('@/components/DriverDashboard'));
const BusinessDashboard = lazy(() => import('@/components/BusinessDashboard'));
const BusinessLanding = lazy(() => import('@/components/BusinessLanding'));
const CustomerDashboard = lazy(() => import('@/components/CustomerDashboard')); // Often same as HistoryList + Profile
const HistoryList = lazy(() => import('@/components/HistoryList'));
const RidesPage = lazy(() => import('@/components/RidesPage'));

const SkeletonFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
      <div className="h-4 w-40 bg-gray-200 rounded-lg" />
      <div className="h-3 w-28 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const App = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Show onboarding if new user
  useEffect(() => {
    if (user && !user.phone) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleRequireAuth = () => {
    setShowAuthModal(true);
  };

  if (isLoading) return <SkeletonFallback />;

  // Determine if Navbar/BottomNav should be hidden (admin/driver dashboards often hide them)
  const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('driver');
  const showNavs = !isDashboard;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />

      <MapProvider>
        {isDashboard ? (
          // Minimal layout for dashboards if needed, or just let dashboard handle it.
          // Usually Navbar is global.
          <Navbar
            onMenuClick={() => setIsMenuOpen(true)}
            onLoginClick={() => setShowAuthModal(true)}
            isDashboard={true}
          />
        ) : (
          <Navbar
            onMenuClick={() => setIsMenuOpen(true)}
            onLoginClick={() => setShowAuthModal(true)}
          />
        )}

        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onLogin={() => { setIsMenuOpen(false); setShowAuthModal(true); }}
          onProfile={() => { setIsMenuOpen(false); setShowProfile(true); }}
        />

        <main className="flex-grow flex flex-col relative">
          <Suspense fallback={<SkeletonFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Hero />} />
              <Route path="/business" element={<BusinessLanding />} />

              {/* Customer Routes */}
              <Route path="/book" element={<BookingPage onRequireAuth={handleRequireAuth} />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/history" element={
                <ProtectedRoute allowedRoles={['customer', 'business', 'driver']}>
                  <HistoryList />
                </ProtectedRoute>
              } />
              <Route path="/rides" element={<RidesPage />} />
              <Route path="/customer-dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />

              {/* Driver Routes */}
              <Route path="/driver" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard onGoHome={() => { }} />
                </ProtectedRoute>
              } />

              {/* Business Routes */}
              <Route path="/business-dashboard" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {!isDashboard && <BottomNav />}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />

        {user && (
          <ProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            user={user}
          />
        )}

        <DebugSimulation />

      </MapProvider>
    </div>
  );
};

export default App;
