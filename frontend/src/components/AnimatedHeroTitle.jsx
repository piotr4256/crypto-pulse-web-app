import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

// Phases: 'text' → 'collapsing' → 'bitcoin' → 'pulse' → 'expanding' → 'text'
const PHASE_DURATION = {
  text: 3500,
  collapsing: 700,
  bitcoin: 1200,
  pulse: 1200,
  expanding: 700,
};

const CRYPTO_TEXT = 'Crypto';
const PULSE_TEXT = 'Pulse';
const ALL_LETTERS = [...CRYPTO_TEXT, ...PULSE_TEXT];
const CENTER = (ALL_LETTERS.length - 1) / 2; // 5.5

// Bitcoin SVG matching the navbar style
const BitcoinIcon = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#00d4ff" opacity="0.1" />
    <circle cx="50" cy="50" r="46" stroke="#00d4ff" strokeWidth="3" fill="none"
      style={{ filter: 'drop-shadow(0 0 12px #00d4ff)' }} />
    <text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="bold"
      fill="#00d4ff" fontFamily="Arial, sans-serif"
      style={{ filter: 'drop-shadow(0 0 8px #00d4ff)' }}>₿</text>
  </svg>
);

const AnimatedHeroTitle = () => {
  const [phase, setPhase] = useState('text');

  useEffect(() => {
    const nextPhase = {
      text: 'collapsing',
      collapsing: 'bitcoin',
      bitcoin: 'pulse',
      pulse: 'expanding',
      expanding: 'text',
    };
    const timer = setTimeout(() => {
      setPhase(prev => nextPhase[prev]);
    }, PHASE_DURATION[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  const isCollapsing = phase === 'collapsing';
  const isHidden = phase === 'bitcoin' || phase === 'pulse';
  const isExpanding = phase === 'expanding';
  const showText = phase === 'text' || isCollapsing || isExpanding;
  const showBitcoin = phase === 'bitcoin';
  const showPulse = phase === 'pulse';

  const getLetterStyle = (index) => {
    const distFromCenter = index - CENTER;
    const direction = distFromCenter < 0 ? 1 : distFromCenter > 0 ? -1 : 0;
    const magnitude = Math.abs(distFromCenter) * 14;

    if (isCollapsing) {
      return {
        transform: `translateX(${direction * magnitude}px) scale(0)`,
        opacity: 0,
        transition: `transform ${PHASE_DURATION.collapsing}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${PHASE_DURATION.collapsing}ms ease`,
      };
    }
    if (isHidden) {
      return {
        transform: `translateX(${direction * magnitude}px) scale(0)`,
        opacity: 0,
        transition: 'none',
      };
    }
    if (isExpanding) {
      return {
        transform: 'translateX(0) scale(1)',
        opacity: 1,
        transition: `transform ${PHASE_DURATION.expanding}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${PHASE_DURATION.expanding}ms ease`,
      };
    }
    // 'text' phase
    return {
      transform: 'translateX(0) scale(1)',
      opacity: 1,
      transition: 'none',
    };
  };

  return (
    <div className="relative flex flex-col items-center select-none" style={{ minHeight: 120 }}>
      {/* Text layer */}
      <h1
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter drop-shadow-xl flex py-4"
        style={{
          visibility: showText ? 'visible' : 'hidden',
          pointerEvents: 'none',
        }}
      >
        {ALL_LETTERS.map((letter, i) => {
          const isCryptoPart = i < CRYPTO_TEXT.length;
          return (
            <span
              key={i}
              className={`inline-block ${isCryptoPart ? 'text-white' : 'text-crypto-primary text-glow-primary'}`}
              style={getLetterStyle(i)}
            >
              {letter}
            </span>
          );
        })}
      </h1>

      {/* Bitcoin icon layer */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: showBitcoin ? 1 : 0,
          scale: showBitcoin ? '1' : '0.3',
          transition: showBitcoin
            ? 'opacity 0.4s ease, scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'opacity 0.3s ease, scale 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        <BitcoinIcon />
      </div>

      {/* Activity/Pulse icon layer */}
      <div
        className="absolute top-1/2 left-1/2 text-crypto-primary"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: showPulse ? 1 : 0,
          scale: showPulse ? '1' : '0.3',
          transition: showPulse
            ? 'opacity 0.4s ease, scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'opacity 0.3s ease, scale 0.3s ease',
          pointerEvents: 'none',
          filter: showPulse ? 'drop-shadow(0 0 16px #00d4ff)' : 'none',
        }}
      >
        <Activity size={96} strokeWidth={1.5} className="animate-activity-pulse" />
      </div>
    </div>
  );
};

export default AnimatedHeroTitle;
