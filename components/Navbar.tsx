import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Clock, User, ChevronDown, Repeat, LayoutDashboard, LogOut, Briefcase, Settings, Menu, X, Shield, Lock, Home, Globe, Bell, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrompt } from '../context/PromptContext';
import DropdownMenu from './DropdownMenu';

interface NavbarProps {
  onOpenProfile?: () => void;
  onLogin?: () => void;
  isDarkBackground?: boolean;
  isMapPage?: boolean;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onLogin, isDarkBackground, isMapPage, isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { showConfirm } = usePrompt();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const toggleProfileDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsMobileDropdownOpen(false);
  };

  const toggleMobileDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
    setIsProfileDropdownOpen(false);
  };

  const handleLogoClick = () => {
    if (isMapPage) {
      navigate('/');
      return;
    }
    // If on business page, go home
    if (window.location.pathname === '/business') {
      navigate('/');
      return;
    }

    if (user?.role === 'driver') {
      navigate('/driver/dashboard');
    } else if (user?.role === 'business') {
      navigate('/business/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleDriveClick = () => {
    if (!user) {
      onLogin?.();
      return;
    }
    if (user.role === 'customer' || user.role === 'business') {
      // Enforce strict separation
      showConfirm(
        "Driver Access",
        "To access the Driver Dashboard, you must be logged in as a Driver. Do you want to log out and sign in with a Driver account?",
        () => handleLogout(),
        'confirm'
      );
      return;
    }
    navigate('/driver/dashboard');
  };

  const handleBusinessClick = () => {
    // Business Landing Page is public, but if they want to click "Get Started" there, it handles auth.
    navigate('/business');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMobileDropdownOpen(false);
  };

  return (
    <nav className="relative max-w-7xl mx-auto bg-transparent h-16 transition-all px-6 flex justify-between items-center">
      {/* Logo or Back Button */}
      {isMapPage ? (
        <button
          onClick={handleLogoClick}
          className={`p-2 rounded-full transition-all active:scale-95 ${isDarkBackground ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white shadow-sm border border-white/50'}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      ) : (
        <div
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-1.5 rounded-lg shadow-sm group-hover:shadow-brand-300 transition-all">
            <Truck className="text-white w-5 h-5" />
          </div>
          <span className={`font-bold text-lg tracking-tight ${isDarkBackground ? 'text-white' : 'text-slate-800'}`}>Tuma<span className="text-brand-600">Fast</span></span>
        </div>
      )}

      {/* Desktop Actions */}
      {!isMapPage && (
        <div className="hidden sm:flex items-center space-x-3 sm:space-x-6">

          {/* Action Button based on Role */}
          {!user ? (
            <div className="flex items-center space-x-6">
              <button
                onClick={handleBusinessClick}
                className={`text-sm font-semibold transition-colors ${isDarkBackground ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-brand-600'}`}
              >
                For Business
              </button>
              <button
                onClick={handleDriveClick}
                className={`text-sm font-semibold transition-colors ${isDarkBackground ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-brand-600'}`}
              >
                Drive with us
              </button>
            </div>
          ) : (
            <>
              {user.role !== 'customer' && (
                <button
                  onClick={() => navigate(user.role === 'business' ? '/business/dashboard' : '/driver/dashboard')}
                  className={`text-sm font-bold flex items-center px-3 py-1.5 rounded-lg transition-all ${isDarkBackground ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                </button>
              )}
            </>
          )}

          <div className={`h-5 w-px ${isDarkBackground ? 'bg-white/20' : 'bg-gray-200'}`}></div>

          {/* Profile Button (Opens Dropdown) */}
          {user ? (
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className={`flex items-center space-x-2 border rounded-full pl-1 pr-3 py-1 transition-all ${isDarkBackground ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-gray-50 hover:bg-gray-100 border-gray-100'}`}
              >
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="Avatar" className="w-7 h-7 rounded-full border border-gray-200" />
                <span className={`text-xs font-semibold max-w-[80px] truncate ${isDarkBackground ? 'text-white' : 'text-gray-700'}`}>{user.name}</span>
                <ChevronDown className={`w-4 h-4 ml-1 ${isDarkBackground ? 'text-white/60' : 'text-gray-400'}`} />
              </button>
              <DropdownMenu
                isOpen={isProfileDropdownOpen}
                onClose={() => setIsProfileDropdownOpen(false)}
                user={user}
              />
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-brand-200"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Mobile Menu Button (Opens Dropdown) */}
      <div className={`relative ${isMapPage ? '' : 'sm:hidden'}`}>
        {user ? (
          <>
            <button
              className={`${isMapPage ? 'flex' : 'flex'} p-2 transition-colors ${isDarkBackground ? 'text-white' : 'text-gray-600'} ${isMapPage ? 'bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-white/50 !text-slate-700 pointer-events-auto' : ''}`}
              onClick={toggleMobileDropdown}
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Dropdown */}
            <DropdownMenu
              isOpen={isMobileDropdownOpen}
              onClose={() => setIsMobileDropdownOpen(false)}
              user={user}
            />
          </>
        ) : (
          <button
            onClick={onLogin}
            className={`text-sm font-bold px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-brand-200 ${isMapPage ? 'bg-brand-600 text-white pointer-events-auto' : 'bg-brand-600 text-white'}`}
          >
            Sign In
          </button>
        )}
      </div>

    </nav >
  );
};

export default Navbar;
