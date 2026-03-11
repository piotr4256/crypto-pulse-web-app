import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Activity, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-crypto-bg/90 backdrop-blur-md border-b border-gray-800/50 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-crypto-primary hover:text-blue-400 transition-colors">
          <Activity size={24} className="animate-pulse" />
          <span className="font-bold text-xl tracking-wide text-white">Crypto<span className="text-crypto-primary">Pulse</span></span>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
            Rynek
          </Link>
          <Link to="/exchanges" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
            Giełdy
          </Link>
          <Link to="/trending" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
            Trendy
          </Link>
          {user && (
            <Link to="/watchlist" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
              Moja Lista
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 hidden sm:inline-block border border-gray-800 px-3 py-1 rounded-full">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-400 hover:text-crypto-red transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline-block">Wyloguj</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Zaloguj
              </Link>
              <Link to="/register" className="btn-primary flex items-center space-x-1 text-sm py-1.5 px-3">
                <User size={16} />
                <span>Rejestracja</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
