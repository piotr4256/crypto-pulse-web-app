import React from 'react';
import Navbar from './Navbar';
import CryptoTicker from './CryptoTicker';
import LiquidEther from './LiquidEther';
import Particles from './Particles';
import ScrollToTopButton from './ScrollToTopButton';

/**
 * Layout — główny szkielet (wrapper) aplikacji.
 * Odpowiada za stały układ elementów: tło, nawigację, ticker cenowy oraz stopkę.
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col pt-[120px] relative bg-[#050508]">
      
      {/* Warstwa tła: interaktywne cząsteczki zablokowane za zawartością (z-0) */}
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
      
      {/* Warstwa główna (z-10): interfejs użytkownika */}
      <div className="relative z-10 flex-1 flex flex-col bg-transparent">
        {/* Pasek nawigacji widoczny na każdej podstronie */}
        <Navbar />
        
        {/* Ruchomy pasek z aktualnymi kursami topowych kryptowalut */}
        <CryptoTicker />
        
        {/* Dynamiczna treść aktualnie otwartej podstrony ({children}) */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        
        {/* Stopka z automatycznym rokiem */}
        <footer className="border-t border-gray-800/50 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CryptoPulse.
        </footer>
      </div>
      
      {/* Pływający przycisk powrotu na górę strony */}
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
