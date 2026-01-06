
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Phone, CreditCard, Home, Save, Loader } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    idNumber: user?.idNumber || '',
    address: user?.address || ''
  });

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 p-1 relative">
              <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border-2 border-white shadow-sm ${user.role === 'driver' ? 'bg-yellow-100 text-yellow-700' :
                user.role === 'business' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                {user.role}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/50 outline-none text-sm font-medium bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/50 outline-none text-sm font-medium bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/50 outline-none text-sm font-medium bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/50 outline-none text-sm font-medium bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/50 outline-none text-sm font-medium bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center shadow-lg hover:shadow-brand-500/25"
            >
              {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
