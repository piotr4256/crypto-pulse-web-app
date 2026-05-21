import React from 'react';
import Navbar from './Navbar';
import CryptoTicker from './CryptoTicker';
import LiquidEther from './LiquidEther';
import Particles from './Particles';
import ScrollToTopButton from './ScrollToTopButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col pt-[120px] relative bg-[#050508]">
      <div className="fixed inset-0 z-0 pointer-events-none blur-[0.5px]">
        <Particles
          particleColors={["#00d4ff"]}
          particleCount={500}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="relative z-10 flex-1 flex flex-col bg-transparent">
        <Navbar />
        <CryptoTicker />
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
