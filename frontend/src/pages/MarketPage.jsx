import React, { useEffect, useState } from 'react';

import { useStore } from '../store/useStore';
import { Star, TrendingUp, TrendingDown, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CryptoTicker from '../components/CryptoTicker';
import PortfolioSection from '../components/PortfolioSection';

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const { user, watchlist, toggleWatchlist, marketData: cryptos, isLoading: loading, error, fetchMarketData } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const handleToggleStar = (cryptoId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWatchlist(cryptoId);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredCryptos = React.useMemo(() => {
    let items = cryptos.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      items.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'name') {
           aValue = a.name.toLowerCase();
           bValue = b.name.toLowerCase();
        } else if (sortConfig.key === 'price') {
           aValue = a.current_price;
           bValue = b.current_price;
        } else if (sortConfig.key === 'change') {
           aValue = a.price_change_percentage_24h;
           bValue = b.price_change_percentage_24h;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [cryptos, searchTerm, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-crypto-primary text-glow-primary" /> 
      : <ArrowDown size={14} className="ml-1 text-crypto-primary text-glow-primary" />;
  };

  return (
    <div className="space-y-12">
      {/* Pasek Ticker */}
      <div className="-mx-4 sm:-mx-8 lg:-mx-16 -mt-8 mb-8">
        <CryptoTicker />
      </div>

      {/* Hero Section / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">Crypto<span className="text-crypto-primary text-glow-primary">Pulse</span></h1>
          <p className="text-gray-400 text-lg">Aktualne kursy i notowania największych walut</p>
        </div>
        
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-0 bg-crypto-primary/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <Search className="absolute left-4 top-3 text-crypto-primary z-10" size={20} />
          <input 
            type="text" 
            placeholder="Szukaj waluty..." 
            className="input-field pl-12 py-3 text-lg bg-crypto-card/80 backdrop-blur-md relative z-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Portfolio Section */}
      <PortfolioSection />

      {/* Main Table */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-3xl font-bold text-white">Wszystkie <span className="text-crypto-green text-glow-green">Kryptowaluty</span></h2>
        </div>
        <div className="card overflow-x-auto bg-crypto-card/60 backdrop-blur-xl border border-gray-800/80 hover:box-glow-primary transition-shadow duration-500 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800/50 bg-gray-900/20">
              <th className="p-4 font-medium text-gray-400 w-12 text-center">⭑</th>
              <th 
                className="p-4 font-medium text-gray-400 cursor-pointer hover:text-crypto-primary transition-colors group select-none"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">Nazwa {getSortIcon('name')}</div>
              </th>
              <th 
                className="p-4 font-medium text-gray-400 text-right cursor-pointer hover:text-crypto-primary transition-colors group select-none"
                onClick={() => requestSort('price')}
              >
                <div className="flex items-center justify-end">Cena {getSortIcon('price')}</div>
              </th>
              <th 
                className="p-4 font-medium text-gray-400 text-right cursor-pointer hover:text-crypto-primary transition-colors group select-none"
                onClick={() => requestSort('change')}
              >
                <div className="flex items-center justify-end">Zmiana 24h {getSortIcon('change')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  <div className="flex justify-center mb-2">
                    <div className="w-6 h-6 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
                  </div>
                  Ładowanie danych rynkowych...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-red-500">
                  <div className="bg-red-500/10 rounded-lg p-4 max-w-lg mx-auto border border-red-500/30">
                    <p className="font-medium mb-1">⚠ Błąd pobierania danych</p>
                    <p className="text-sm text-red-400">{error}</p>
                    <p className="text-xs text-red-400/70 mt-2">Darmowe API CoinGecko ma ograniczenia zapytań. Spróbuj odświeżyć za chwilę.</p>
                  </div>
                </td>
              </tr>
            ) : sortedAndFilteredCryptos.length > 0 ? (
              sortedAndFilteredCryptos.map((coin) => {
                const isFaved = watchlist.includes(coin.id);
                const isUp = coin.price_change_percentage_24h >= 0;

                return (
                  <tr 
                    key={coin.id} 
                    onClick={() => navigate(`/coin/${coin.id}`)}
                    className="hover:bg-crypto-primary/10 transition-all cursor-pointer duration-300 group border-b border-gray-800/30 last:border-0 hover:shadow-[inset_4px_0_0_rgba(0,212,255,1)]"
                  >
                    <td className="p-5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStar(coin.id); }}
                        className={`transition-colors focus:outline-none focus:ring-2 focus:ring-crypto-primary/50 rounded-full p-1.5 
                          ${isFaved ? 'text-crypto-yellow text-glow-yellow' : 'text-gray-600 group-hover:text-crypto-primary/50'}`}
                      >
                        <Star size={22} fill={isFaved ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="p-5 flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center bg-gray-800 overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-shadow duration-300 relative z-0">
                        {coin.image ? (
                           <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-sm font-bold text-gray-300">{coin.symbol[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white group-hover:text-crypto-primary transition-colors">{coin.name}</div>
                        <div className="text-xs text-crypto-primary/70 font-bold uppercase tracking-wider">{coin.symbol}</div>
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
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Brak wyników
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default MarketPage;
