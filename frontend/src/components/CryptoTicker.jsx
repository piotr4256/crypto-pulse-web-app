import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const CryptoTicker = () => {
  const { marketData, fetchMarketData } = useStore();
  
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Take top 20 for ticker
  const tickerData = marketData.slice(0, 20);

  if (tickerData.length === 0) return null;

  if (tickerData.length === 0) return null;

  return (
    <div className="w-full bg-crypto-card/80 backdrop-blur-sm border-b border-t border-gray-800/80 overflow-hidden flex items-center h-14 relative z-10">
      
      {/* Container dla animacji (podwójny aby zlikwidować przerwę pod koniec) */}
      <div className="flex animate-marquee whitespace-nowrap group w-fit">
        
        {/* Pierwszy zestaw */}
        <div className="flex shrink-0 items-center justify-start gap-6 px-3">
            {tickerData.map((coin, idx) => {
              const isUp = coin.price_change_percentage_24h >= 0;
              return (
                <Link key={`first-${coin.id}-${idx}`} to={`/coin/${coin.id}`} className="flex items-center px-4 py-2 space-x-3 hover:bg-white/5 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-gray-800/50">
                    <div className="flex items-center space-x-2">
                        {coin.image && <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full hover:scale-110 transition-transform" />}
                        <span className="text-sm font-bold text-gray-300 uppercase group-hover:text-crypto-primary transition-colors">{coin.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-bold flex items-center ${isUp ? 'text-crypto-green text-glow-green' : 'text-crypto-red text-glow-red'}`}>
                        {isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                </Link>
              );
           })}
        </div>

        {/* Drugi zestaw - duplikat gładko wjeżdżający za pierwszym */}
        <div className="flex shrink-0 items-center justify-start gap-6 px-3">
           {tickerData.map((coin, idx) => {
              const isUp = coin.price_change_percentage_24h >= 0;
              return (
                <Link key={`second-${coin.id}-${idx}`} to={`/coin/${coin.id}`} className="flex items-center px-4 py-2 space-x-3 hover:bg-white/5 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-gray-800/50">
                    <div className="flex items-center space-x-2">
                        {coin.image && <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full hover:scale-110 transition-transform" />}
                        <span className="text-sm font-bold text-gray-300 uppercase group-hover:text-crypto-primary transition-colors">{coin.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-bold flex items-center ${isUp ? 'text-crypto-green text-glow-green' : 'text-crypto-red text-glow-red'}`}>
                        {isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                </Link>
              );
           })}
        </div>
        
      </div>
    </div>
  );
};

export default CryptoTicker;
