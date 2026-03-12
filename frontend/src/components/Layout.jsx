import React from 'react';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';
import ScrollToTopButton from './ScrollToTopButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col pt-16 relative bg-transparent">
      <AnimatedBackground />
      <div className="relative z-10 flex-1 flex flex-col bg-transparent">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-800/50 py-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CryptoPulse.
          </footer>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
