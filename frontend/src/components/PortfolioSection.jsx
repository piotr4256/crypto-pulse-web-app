import React, { useState, useEffect, useRef } from 'react';
import { useMarketQuery } from '../hooks/queries';
import { Link } from 'react-router-dom';
import GlareHover from './GlareHover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = ['Popularne', 'Nagrody', 'Stablecoiny', 'Ostatnio notowane'];

const PortfolioSection = () => {
  const [activeTab, setActiveTab] = useState('Popularne');
  const [cryptos, setCryptos] = useState([]);
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef(null);
  const tabsRef = useRef({});

  const { data: marketData = [], isLoading } = useMarketQuery();

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

  useEffect(() => {
    const activeTabEl = tabsRef.current[activeTab];
    if (activeTabEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full max-w-6xl mx-auto my-12 antialiased">

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full flex justify-center mb-8">
          <TabsList ref={containerRef} className="nav-pill-container !bg-crypto-card/30 !p-1 border-white/5 h-auto p-0 rounded-full flex relative">
            <div 
              className="nav-indicator !bg-crypto-primary/10 !border-crypto-primary/20 absolute transition-all duration-300 ease-out" 
              style={{ 
                left: indicatorStyle.left, 
                width: indicatorStyle.width,
                height: 'calc(100% - 8px)',
                top: '4px'
              }} 
            />
            {TABS.map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                ref={el => tabsRef.current[tab] = el}
                className="relative z-10 px-6 py-2 rounded-full font-medium outline-none text-sm bg-transparent border-transparent data-[state=active]:bg-transparent data-active:bg-transparent data-[state=active]:shadow-none data-active:shadow-none text-gray-400 hover:text-white data-[state=active]:text-crypto-primary data-active:text-crypto-primary transition-colors"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

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
