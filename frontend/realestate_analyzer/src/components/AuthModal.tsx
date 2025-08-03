import React from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  showModal: boolean;
  isDark: boolean;
  activeTab: string;
  formData: {
    username: string;
    email: string;
    password: string;
  };
  handleModalClose: () => void;
  handleTabChange: (tab: string) => void;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function AuthModal({
  showModal,
  isDark,
  activeTab,
  formData,
  handleModalClose,
  handleTabChange,
  handleInputChange,
  handleSubmit
}: AuthModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleModalClose}
      ></div>
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="pt-12 px-8 pb-0">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => handleTabChange('signin')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'signin'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-white'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'signup'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-white'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email Field (Sign Up only) */}
            {activeTab === 'signup' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700'
              }`}
            >
              {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}