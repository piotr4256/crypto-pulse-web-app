import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { Activity, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

// Bitcoin SVG icon as a component
const BitcoinIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="11" fill="#00d4ff" opacity="0.15" />
    <circle cx="12" cy="12" r="11" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
    <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#00d4ff" fontFamily="Arial, sans-serif">₿</text>
  </svg>
);

const Navbar = () => {
  // Zustand: Pobranie danych zalogowanego użytkownika oraz funkcji wylogowania ze wspólnego store
  const { user, logout } = useAuthStore();

  // TanStack Query: Dostęp do klienta cache zapytań HTTP
  const queryClient = useQueryClient();

  // React Router: Nawigacja między podstronami oraz śledzenie aktualnego URL-a
  const navigate = useNavigate();
  const location = useLocation();

  // State dla animacji ikony logo
  const [showBitcoin, setShowBitcoin] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // State animowanego wskaźnika (kolor i długość) pod aktywnym linkiem
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);
  const linksRef = useRef({});

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

  // Indicator Logic
  useEffect(() => {
    const activeLink = linksRef.current[location.pathname];
    if (activeLink && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      setIndicatorStyle({
        left: linkRect.left - containerRect.left,
        width: linkRect.width,
        opacity: 1
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [location.pathname]);

  // Funkcja wylogowania — czyści sesję w Zustand oraz cały cache w TanStack Query
  const handleLogout = () => {
    // 1. Zustand: ustawia user=null i token=null (persist automatycznie zeruje też localStorage)
    logout();

    // 2. TanStack Query: usuwa z pamięci podręcznej RAM wszystkie zapytania i watchlisty,
    // zapobiegając wyciekowi danych między różnymi kontami
    queryClient.clear();

    // 3. Nawigacja: przekierowuje użytkownika na stronę logowania
    navigate('/login');
  };

  const navLinks = [
    { name: 'Rynek', path: '/' },
    { name: 'Giełdy', path: '/exchanges' },
    { name: 'Trendy', path: '/trending' },
    { name: 'Ulubione', path: '/ulubione' },
  ];

  const NavItem = ({ name, path }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        ref={el => linksRef.current[path] = el}
        className={`nav-link-item ${isActive ? 'text-crypto-primary' : 'text-gray-400 hover:text-white'}`}
      >
        {name}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 inset-x-0 h-16 z-50 group/nav">
      {/* Luxury Background Layers */}
      <div className="absolute inset-0 bg-crypto-bg/80 backdrop-blur-2xl border-b border-white/5" />

      {/* Top Highlight Line (The "Glass Edge") */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crypto-primary/40 to-transparent opacity-50" />

      {/* Subtle Radial Glow from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-crypto-primary/5 blur-[80px] pointer-events-none" />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="w-full px-4 md:px-10 h-full flex items-center justify-between relative">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-crypto-primary hover:text-blue-400 transition-colors z-20 group">
          <div
            style={{ perspective: '200px', width: 28, height: 28 }}
            className="relative flex items-center justify-center group-hover:animate-logo-flip"
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
                ? <BitcoinIcon size={26} className="animate-bitcoin-coin" />
                : <Activity size={24} className="animate-activity-pulse" />
              }
            </div>
          </div>
          <span className="font-bold text-xl tracking-wide text-white">Crypto<span className="text-crypto-primary">Pulse</span></span>
        </Link>

        {/* Links */}
        <div className="flex absolute left-1/2 -translate-x-1/2 items-center">
          <div ref={containerRef} className="nav-pill-container">
            <div
              className="nav-indicator"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity
              }}
            />
            {navLinks.map(link => (
              <NavItem key={link.name} name={link.name} path={link.path} />
            ))}
          </div>
        </div>

        {/* Panel Akcji (Logowanie / Stan Użytkownika) */}
        <div className="flex items-center z-20">
          {/* 
            Renderowanie warunkowe (ternary operator):
            Sprawdzamy czy użytkownik (user) jest zalogowany.
          */}
          {user ? (
            /* WARIANT A: Użytkownik jest ZALOGOWANY - pokaż profil i przycisk wylogowania */
            <div className="flex items-center space-x-3">
              {/* Badge z e-mailem zalogowanego użytkownika */}
              <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                <User size={14} className="text-crypto-primary" />
                <span className="text-xs font-medium text-gray-300">{user.email}</span>
              </div>
              {/* Przycisk wylogowania, który czyści sesję w Zustand i cache w TanStack Query */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="rounded-full text-gray-400 hover:text-crypto-red hover:bg-crypto-red/10 border border-transparent hover:border-crypto-red/20 transition-all duration-300"
              >
                <LogOut size={16} className="mr-2" />
                <span>Wyloguj</span>
              </Button>
            </div>
          ) : (
            /* WARIANT B: Użytkownik jest NIEZALOGOWANY - pokaż przyciski Logowania i Rejestracji */
            <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-full backdrop-blur-md space-x-1">
              {/* Odnośnik do strony logowania */}
              <Button asChild variant="ghost" className="rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300">
                <Link to="/login">Zaloguj</Link>
              </Button>
              {/* Odnośnik do formularza rejestracji nowego konta */}
              <Button asChild className="rounded-full bg-crypto-primary/10 border border-crypto-primary/30 text-crypto-primary hover:bg-crypto-primary/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300">
                <Link to="/register" className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Rejestracja</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
