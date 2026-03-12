import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Activity, LogOut, User, Menu, X } from 'lucide-react';

// Bitcoin SVG icon as a component
const BitcoinIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#00d4ff" opacity="0.15" />
    <circle cx="12" cy="12" r="11" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
    <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#00d4ff" fontFamily="Arial, sans-serif">₿</text>
  </svg>
);

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBitcoin, setShowBitcoin] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start flip animation
      setIsFlipping(true);
      setTimeout(() => {
        // Halfway through flip – swap the icon
        setShowBitcoin(prev => !prev);
      }, 300);
      setTimeout(() => {
        // End of flip animation
        setIsFlipping(false);
      }, 600);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Rynek', path: '/' },
    { name: 'Giełdy', path: '/exchanges' },
    { name: 'Trendy', path: '/trending' },
  ];

  if (user) {
    navLinks.push({ name: 'Moja Lista', path: '/watchlist' });
  }

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItem = ({ name, path }) => {
    const isActive = location.pathname === path;
    return (
      <Link 
        to={path} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`font-medium transition-colors ${isActive ? 'text-crypto-primary' : 'text-gray-300 hover:text-white'} block md:inline-block py-2 md:py-0 w-full md:w-auto text-lg md:text-sm`}
      >
        {name}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-crypto-bg/95 backdrop-blur-md border-b border-gray-800/50 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 text-crypto-primary hover:text-blue-400 transition-colors z-20">
          <div
            style={{ perspective: '200px', width: 28, height: 28 }}
            className="relative flex items-center justify-center"
          >
            <div
              style={{
                transition: 'transform 0.6s ease-in-out',
                transform: isFlipping
                  ? (showBitcoin ? 'rotateY(-90deg)' : 'rotateY(90deg)')
                  : 'rotateY(0deg)',
                transformStyle: 'preserve-3d',
              }}
              className="flex items-center justify-center"
            >
              {showBitcoin
                ? <BitcoinIcon size={26} />
                : <Activity size={24} className="animate-activity-pulse" />
              }
            </div>
          </div>
          <span className="font-bold text-xl tracking-wide text-white">Crypto<span className="text-crypto-primary">Pulse</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
             <NavItem key={link.name} name={link.name} path={link.path} />
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 border border-gray-800 px-3 py-1 rounded-full">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-400 hover:text-crypto-red transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span>Wyloguj</span>
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

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white focus:outline-none z-20 p-2"
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-crypto-bg border-b border-gray-800/50 shadow-2xl flex flex-col px-4 py-6 space-y-6">
           <div className="flex flex-col space-y-4">
             {navLinks.map(link => (
               <NavItem key={link.name} name={link.name} path={link.path} />
             ))}
           </div>
           
           <div className="pt-6 border-t border-gray-800/50 flex flex-col space-y-4">
             {user ? (
                <>
                  <div className="text-gray-400 font-medium">{user.email}</div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 text-crypto-red hover:text-red-400 transition-colors py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/20 w-full"
                  >
                    <LogOut size={20} />
                    <span className="font-medium text-lg">Wyloguj</span>
                  </button>
                </>
             ) : (
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-center py-3 rounded-lg border border-gray-700 text-white font-medium hover:bg-gray-800 transition-colors w-full"
                  >
                    Zaloguj się
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="btn-primary w-full text-center py-3 flex items-center justify-center space-x-2"
                  >
                    <User size={20} />
                    <span className="font-medium text-lg">Zarejestruj się</span>
                  </Link>
                </div>
             )}
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
