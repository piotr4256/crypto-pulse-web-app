import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import GlareHover from './GlareHover';

const TABS = ['Popularne', 'Nagrody', 'Stablecoiny', 'Ostatnio notowane'];

const PortfolioSection = () => {
  const [activeTab, setActiveTab] = useState('Popularne');
  const [cryptos, setCryptos] = useState([]);

  const { marketData, isLoading, fetchMarketData } = useStore();

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    if (marketData.length > 0) {
      let filtered = marketData;
      if (activeTab === 'Popularne') {
        filtered = marketData.slice(0, 6);
      } else if (activeTab === 'Nagrody') {
        filtered = marketData.filter(c => ['ETH', 'ADA', 'DOT', 'SOL'].includes(c.symbol.toUpperCase())).slice(0, 6);
      } else if (activeTab === 'Stablecoiny') {
        filtered = marketData.filter(c => ['USDT', 'USDC', 'DAI', 'BUSD'].includes(c.symbol.toUpperCase())).slice(0, 6);
      } else {
        filtered = marketData.slice(15, 21); // just some other coins
      }
      setCryptos(filtered);
    }
  }, [marketData, activeTab]);

  return (
    <div className="w-full max-w-6xl mx-auto my-12 antialiased">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-wide">
          Zbuduj swoje <span className="text-crypto-primary text-glow-primary">portfolio kryptowalutowe</span>
        </h2>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          Rozpocznij swoją podróż w świecie cyfrowych finansów.<br />  Śledź najpopularniejsze aktywa w jednym miejscu.
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-4 mb-4 hide-scrollbar">
        <div className="flex items-center sm:justify-center flex-nowrap gap-2 px-2 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 sm:px-6 py-2.5 rounded-full font-medium transition-all duration-300 backdrop-blur-md outline-none
                  ${activeTab === tab
                  ? 'bg-crypto-primary/20 text-crypto-primary border border-crypto-primary shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                  : 'bg-crypto-card/50 text-gray-400 border border-transparent hover:text-white hover:bg-gray-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
          </div>
        ) : cryptos.map(coin => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <Link to={`/coin/${coin.id}`} key={coin.id} className="block group">
              <GlareHover
                className="card p-6 flex items-center justify-between hover:scale-[1.02] hover:box-glow-primary transition-all cursor-pointer w-full"
                glareColor="#00d4ff"
                glareOpacity={0.2}
                glareSize={200}
              >
                <div className="flex items-center space-x-4">
                  {coin.image ? (
                    <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_15px_rgba(0,212,255,0.5)] transition-shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold">{coin.symbol[0]}</div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-crypto-primary transition-colors">{coin.name}</h3>
                    <span className="text-sm font-medium text-gray-500 uppercase">{coin.symbol}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-sm font-bold ${isUp ? 'text-crypto-green text-glow-green' : 'text-crypto-red text-glow-red'}`}>
                    {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </GlareHover>
            </Link>
          )
        })}
      </div>
    </div>
  );
};

export default PortfolioSection;
