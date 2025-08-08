import React from 'react';
import { Moon, Sun, User, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  handleModalOpen: () => void;
}

export default function Header({ isDark, toggleTheme, handleModalOpen }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-sm border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side - Auth buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleModalOpen}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
              <User size={18} />
              <span>Sign In / Sign Up</span>
            </button>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Right side - Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDark 
                ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`}>
              <Zap className="text-white" size={24} />
            </div>
            <span className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              PROPAK
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}