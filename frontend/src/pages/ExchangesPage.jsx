import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, ShieldCheck, Globe, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ExchangesPage = () => {
  const { exchanges, fetchExchanges, isLoading, error } = useStore();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedExchanges = useMemo(() => {
    let sortableItems = [...exchanges];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = 0;
        if (bValue === null || bValue === undefined) bValue = 0;

        if (sortConfig.key === 'name') {
           aValue = String(aValue).toLowerCase();
           bValue = String(bValue).toLowerCase();
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
    return sortableItems;
  }, [exchanges, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-crypto-primary text-glow-primary" /> 
      : <ArrowDown size={14} className="ml-1 text-crypto-primary text-glow-primary" />;
  };

  const getTrustScoreColor = (score) => {
    if (score >= 9) return 'text-crypto-green text-glow-green';
    if (score >= 6) return 'text-crypto-yellow text-glow-yellow';
    return 'text-crypto-red text-glow-red';
  };

  return (
    <div className="space-y-12 animate-fade-in antialiased">
      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Najlepsze <span className="text-crypto-primary text-glow-primary">Giełdy</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Ranking światowych giełd kryptowalut. Sprawdź volumen 24h i wskaźnik wiarygodności (Trust Score).
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="relative z-10 mt-8">
        <div className="card overflow-x-auto bg-crypto-card/60 backdrop-blur-xl border border-gray-800/80 hover:box-glow-primary transition-shadow duration-500 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800/50 bg-gray-900/20">
                <th className="p-4 font-medium text-gray-400 w-16 text-center">#</th>
                <th 
                  className="p-4 font-medium text-gray-400 cursor-pointer hover:text-crypto-primary transition-colors group select-none"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">Giełda {getSortIcon('name')}</div>
                </th>
                <th 
                  className="p-4 font-medium text-gray-400 text-center cursor-pointer hover:text-crypto-primary transition-colors group select-none"
                  onClick={() => requestSort('trust_score')}
                >
                  <div className="flex items-center justify-center">Trust Score {getSortIcon('trust_score')}</div>
                </th>
                <th 
                  className="p-4 font-medium text-gray-400 text-right cursor-pointer hover:text-crypto-primary transition-colors group select-none"
                  onClick={() => requestSort('trade_volume_24h_btc')}
                >
                  <div className="flex items-center justify-end">Wolumen 24h (BTC) {getSortIcon('trade_volume_24h_btc')}</div>
                </th>
                <th className="p-4 font-medium text-gray-400 text-right">Lokalizacja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
                    </div>
                    Ładowanie rankingów...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-red-500">
                    <div className="bg-red-500/10 rounded-lg p-4 max-w-lg mx-auto border border-red-500/30">
                      <p className="font-medium mb-1">⚠ Błąd pobierania danych</p>
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : sortedExchanges.length > 0 ? (
                sortedExchanges.map((exchange) => (
                  <tr 
                    key={exchange.id} 
                    onClick={() => window.open(exchange.url, '_blank')}
                    className="hover:bg-crypto-primary/10 transition-all cursor-pointer duration-300 group border-b border-gray-800/30 last:border-0 hover:shadow-[inset_4px_0_0_rgba(0,212,255,1)]"
                  >
                    <td className="p-5 text-center text-gray-500 font-bold">
                       {exchange.trust_score_rank || '-'}
                    </td>
                    <td className="p-5 flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center bg-gray-800 overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-shadow duration-300">
                         {exchange.image ? (
                           <img src={exchange.image} alt={exchange.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-sm font-bold text-gray-300">{exchange.name[0]}</span>
                         )}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white group-hover:text-crypto-primary transition-colors">{exchange.name}</div>
                        <div className="text-xs text-crypto-primary/70 font-bold">{exchange.year_established ? `Rozpoczęcie: ${exchange.year_established}` : 'Nieznana data'}</div>
                      </div>
                    </td>
                    <td className="p-5 text-center text-lg font-black">
                       <span className={`flex items-center justify-center gap-1 ${getTrustScoreColor(exchange.trust_score)}`}>
                          {exchange.trust_score >= 8 ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                          {exchange.trust_score}/10
                       </span>
                    </td>
                    <td className="p-5 text-right font-bold text-lg text-gray-100">
                      {exchange.trade_volume_24h_btc ? 
                          parseFloat(exchange.trade_volume_24h_btc).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' BTC'
                        : 'Brak'
                      }
                    </td>
                    <td className="p-5 text-right text-gray-400 flex items-center justify-end gap-2">
                      <Globe size={16} className="text-gray-500 group-hover:text-crypto-primary/70" />
                      {exchange.country || 'Globalna'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Brak wyników giełdowych.
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

export default ExchangesPage;
