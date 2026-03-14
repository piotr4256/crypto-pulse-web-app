import React, { useEffect } from 'react';

import { useStore } from '../store/useStore';
import { Star, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const WatchlistPage = () => {
  const { user, watchlist, toggleWatchlist, marketData: cryptos, isLoading: loading, error, fetchMarketData } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMarketData();
  }, [user, navigate, fetchMarketData]);

  const handleToggleStar = (cryptoId) => {
    toggleWatchlist(cryptoId);
  };

  const favoriteCryptos = cryptos.filter(c => watchlist.includes(c.id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">Moja <span className="text-crypto-purple text-glow-purple">Lista</span></h1>
          <p className="text-gray-400 text-lg">Zarządzaj swoimi ulubionymi kryptowalutami</p>
        </div>
      </div>

      <div className="relative z-10 card overflow-hidden bg-crypto-card/60 backdrop-blur-xl border border-gray-800/80 hover:box-glow-purple transition-shadow duration-500 rounded-2xl">
        {loading ? (
             <div className="p-12 pl-top text-center text-gray-500">
               <div className="flex justify-center mb-4">
                 <div className="w-8 h-8 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
               </div>
               Ładowanie twojej listy...
             </div>
        ) : error ? (
             <div className="p-12 pl-top text-center text-red-500">
               <div className="bg-red-500/10 rounded-lg p-4 max-w-lg mx-auto border border-red-500/30">
                 <p className="font-medium mb-1">⚠ Błąd pobierania danych</p>
                 <p className="text-sm text-red-400">{error}</p>
                 <p className="text-xs text-red-400/70 mt-2">Darmowe API CoinGecko ma ograniczenia zapytań. Spróbuj odświeżyć za chwilę.</p>
               </div>
             </div>
        ) : favoriteCryptos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800/50 bg-gray-900/20">
                  <th className="p-4 font-medium text-gray-400 w-12"></th>
                  <th className="p-4 font-medium text-gray-400">Nazwa</th>
                  <th className="p-4 font-medium text-gray-400 text-right">Cena</th>
                  <th className="p-4 font-medium text-gray-400 text-right">Zmiana 24h</th>
                  <th className="p-4 font-medium text-gray-400 text-center w-24">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {favoriteCryptos.map((coin) => {
                  const isUp = coin.price_change_percentage_24h >= 0;

                  return (
                  <tr 
                     key={coin.id} 
                     onClick={() => navigate(`/coin/${coin.id}`)}
                     className="hover:bg-crypto-purple/10 transition-all cursor-pointer duration-300 group border-b border-gray-800/30 last:border-0 hover:shadow-[inset_4px_0_0_rgba(176,38,255,1)]"
                  >
                      <td className="p-5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleStar(coin.id); }}
                          title="Usuń z listy"
                          className="transition-colors focus:outline-none focus:ring-2 focus:ring-crypto-purple/50 text-crypto-yellow text-glow-yellow hover:text-gray-600 rounded-full p-1.5"
                        >
                          <Star size={22} fill="currentColor" />
                        </button>
                      </td>
                      <td className="p-5 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center bg-gray-800 overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(176,38,255,0.6)] transition-shadow duration-300 relative z-0">
                          {coin.image ? (
                             <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-sm font-bold text-gray-300">{coin.symbol[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white group-hover:text-crypto-purple transition-colors">{coin.name}</div>
                          <div className="text-xs text-crypto-purple/70 font-bold uppercase tracking-wider">{coin.symbol}</div>
                        </div>
                      </td>
                      <td className="p-5 text-right font-bold text-lg text-gray-100">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-5 text-right font-bold text-lg flex items-center justify-end space-x-1.5
                        ${isUp ? 'text-crypto-green text-glow-green' : 'text-crypto-red text-glow-red'}`}
                      >
                        {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                      </td>
                      <td className="p-5 text-center">
                        <button 
                           onClick={(e) => { e.stopPropagation(); navigate(`/coin/${coin.id}`); }} 
                           className="text-gray-400 hover:text-crypto-purple transition-colors p-2 rounded-full hover:bg-crypto-purple/20" title="Zobacz szczegóły"
                        >
                           <BarChart2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
             <Star className="text-gray-700 mb-4" size={48} />
             <h3 className="text-xl font-medium text-white mb-2">Twoja lista jest pusta</h3>
             <p className="mb-6">Dodaj pierwsze kryptowaluty do obserwowanych z zakładki Rynek.</p>
             <Link to="/" className="btn-primary">Przeglądaj Rynek</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
