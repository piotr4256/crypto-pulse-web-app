import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Globe, Activity, Flame } from 'lucide-react';

const TrendingPage = () => {
  const { trending, globalStats, fetchTrendingAndGlobal, isLoading, error } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingAndGlobal();
  }, [fetchTrendingAndGlobal]);

  const formatLargeDecimal = (num) => {
    if (!num) return 'Brak';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)} Bln`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)} Mld`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)} Mln`;
    return `$${num.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Błąd</h2>
        <p className="text-gray-400 mb-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in antialiased mt-4">

      {/* Globalne Statystyki */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-8 tracking-tight flex items-center gap-3">
          Puls <span className="text-crypto-primary text-glow-primary">Świata</span> <Globe className="text-crypto-primary" size={40} />
        </h1>
        {globalStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 bg-gradient-to-br from-gray-900/80 to-crypto-card border-l-4 border-crypto-primary hover:-translate-y-1 transition-transform">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Całkowita Kapitalizacja</p>
              <p className="text-3xl font-black text-white">{formatLargeDecimal(globalStats.total_market_cap?.usd)}</p>
              <p className="text-sm text-crypto-primary mt-2 flex items-center"><Activity size={14} className="mr-1" /> Zmiana 24h: {globalStats.market_cap_change_percentage_24h_usd?.toFixed(2)}%</p>
            </div>
            <div className="card p-6 bg-gradient-to-br from-gray-900/80 to-crypto-card border-l-4 border-crypto-yellow hover:-translate-y-1 transition-transform">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Dominacja Rynkowa</p>
              <p className="text-3xl font-black text-white">{globalStats.market_cap_percentage?.btc?.toFixed(1)}% <span className="text-lg text-gray-400 font-medium">BTC</span></p>
              <p className="text-sm text-crypto-yellow mt-2 flex items-center"><Activity size={14} className="mr-1" /> ETH: {globalStats.market_cap_percentage?.eth?.toFixed(1)}%</p>
            </div>
            <div className="card p-6 bg-gradient-to-br from-gray-900/80 to-crypto-card border-l-4 border-crypto-green hover:-translate-y-1 transition-transform">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Aktywne Kryptowaluty</p>
              <p className="text-3xl font-black text-white">{globalStats.active_cryptocurrencies?.toLocaleString()}</p>
              <p className="text-sm text-crypto-green mt-2 flex items-center"><Activity size={14} className="mr-1" /> Śledzonych przez CoinGecko</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Brak danych globalnych.</p>
        )}
      </div>

      {/* Gorąca  (Trending) */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <Flame className="text-crypto-red text-glow-red" size={32} /> Na Fali (Trending)
        </h2>
        <p className="text-gray-400 mb-8 max-w-2xl">
          Najczęściej wyszukiwane monety na świecie w przeciągu ostatnich 24 godzin. Uważaj, hype często wiąże się z wysoką zmiennością!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trending.length > 0 ? (
            trending.map((item) => {
              const coin = item.item;
              const isUp = coin.data?.price_change_percentage_24h?.usd >= 0;

              return (
                <div
                  key={coin.id}
                  onClick={() => navigate(`/coin/${coin.id}`)}
                  className="card p-5 cursor-pointer hover:scale-[1.03] hover:box-glow-primary transition-all group border border-gray-800/80 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 text-9xl text-gray-900/50 font-black z-0 pointer-events-none group-hover:text-crypto-primary/5 transition-colors">
                    #{coin.market_cap_rank || '?'}
                  </div>

                  <div className="flex items-center gap-4 relative z-10 mb-4">
                    <img src={coin.thumb} alt={coin.name} className="w-12 h-12 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(0,212,255,0.4)]" />
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-crypto-primary transition-colors leading-tight">{coin.name}</h3>
                      <p className="text-xs text-crypto-primary/70 font-bold uppercase">{coin.symbol}</p>
                    </div>
                  </div>

                  <div className="relative z-10 bg-gray-900/50 rounded-lg p-3 border border-gray-800/50 mt-4">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cena</p>
                    <p className="text-xl font-bold text-white">
                      ${parseFloat(coin.data?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumSignificantDigits: 4 })}
                    </p>
                    {coin.data?.price_change_percentage_24h?.usd !== undefined && (
                      <p className={`text-sm font-bold flex items-center mt-1 ${isUp ? 'text-crypto-green text-glow-green' : 'text-crypto-red text-glow-red'}`}>
                        {isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {isUp ? '+' : ''}{coin.data.price_change_percentage_24h.usd.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 col-span-full">Brak aktualnych trendów.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default TrendingPage;
