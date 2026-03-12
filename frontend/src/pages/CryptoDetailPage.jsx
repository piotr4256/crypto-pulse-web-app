import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Activity, DollarSign, Layers, PieChart, Info, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { apiService } from '../api/apiService';

const CryptoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { marketData, fetchMarketData, isLoading, watchlist, toggleWatchlist, user } = useStore();
  const [coin, setCoin] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    if (marketData.length > 0) {
      const foundCoin = marketData.find(c => c.id === id);
      setCoin(foundCoin || null);
    }
  }, [marketData, id]);

  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    const fetchChart = async () => {
      setIsChartLoading(true);
      try {
        const res = await apiService.getMarketChart(id, timeframe); // dynamiczne dni
        
        let xFormat = 'dd MMM';
        if (timeframe === 1) xFormat = 'HH:mm';
        if (timeframe === 365) xFormat = 'MMM yyyy';

        const formattedData = res.data.prices.map(item => ({
             time: item[0], // timestamp z coingecko
             dateLabelX: format(new Date(item[0]), xFormat), // dynamiczny format Osi X
             dateLabelTooltip: format(new Date(item[0]), 'dd MMM HH:mm'), // szczegółowe dla myszki
             price: item[1]
        }));
        setChartData(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsChartLoading(false);
      }
    };
    if (id) fetchChart();
  }, [id, timeframe]);

  if (isLoading || (marketData.length === 0 && !coin)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!coin && marketData.length > 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-white mb-4">Nie znaleziono waluty</h2>
        <p className="text-gray-400 mb-8">Waluta o ID &quot;{id}&quot; nie istnieje w bazie CoinGecko lub nie została pobrana.</p>
        <Link to="/" className="btn-primary">Wróć na Rynek</Link>
      </div>
    );
  }

  if (!coin) return null;

  const isUp24h = coin.price_change_percentage_24h >= 0;
  const isUpATH = coin.ath_change_percentage >= 0;
  const isUpATL = coin.atl_change_percentage >= 0;
  const isFaved = watchlist.includes(coin.id);

  const isChartUp = chartData.length > 0
    ? chartData[chartData.length - 1].price >= chartData[0].price
    : isUp24h;

  const formatCurrency = (val) => {
     if (val === null || val === undefined) return 'Brak Danych';
     
     // Specjalny przypadek dla malenkich wartosci (np. shiba inu, dogecoin)
     if (Math.abs(val) < 0.01 && val !== 0) {
        return '$' + val.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumSignificantDigits: 3 
        });
     }
     
     // Standardowe formatowanie (2 miejsca po przecinku)
     return '$' + val.toLocaleString(undefined, { 
         minimumFractionDigits: 2, 
         maximumFractionDigits: 2 
     });
  };

  const handleStarClick = () => {
    if (!user) {
        navigate('/login');
        return;
    }
    toggleWatchlist(coin.id);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in antialiased z-10 relative">
      
      {/* Nagłówek i Powrót */}
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center text-crypto-primary hover:text-crypto-primary/70 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Wróć na Rynek
        </Link>
        <button 
           onClick={handleStarClick}
           className="flex items-center gap-2 bg-crypto-card/60 backdrop-blur-md px-4 py-2 hover:bg-crypto-card transition-colors rounded-full border border-gray-800"
        >
          <Star size={20} className={`${isFaved ? 'text-crypto-yellow text-glow-yellow fill-crypto-yellow' : 'text-gray-400'}`} />
          <span className="text-gray-300 font-medium">{isFaved ? 'W Ulubionych' : 'Dodaj do Obserwowanych'}</span>
        </button>
      </div>

      {/* Hero Karty */}
      <div className="card p-6 sm:p-12 relative overflow-hidden group border border-crypto-primary/20 hover:border-crypto-primary/50 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-crypto-primary/10 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-crypto-purple/10 rounded-full blur-[100px] -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-900 border-2 border-crypto-primary/30 p-2 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                  {coin.image && <img src={coin.image} alt={coin.name} className="w-full h-full object-contain rounded-full" />}
                </div>
                <div>
                   <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                       <span className="px-3 py-1 bg-crypto-primary/20 text-crypto-primary text-xs font-bold uppercase rounded-full tracking-wider border border-crypto-primary/30">
                           Rank #{coin.market_cap_rank || '-'}
                       </span>
                       <span className="text-gray-400 font-bold uppercase tracking-widest">{coin.symbol}</span>
                   </div>
                   <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">{coin.name}</h1>
                </div>
            </div>

            <div className="text-center md:text-right mt-4 md:mt-0">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Aktualna Cena</p>
                <div className="text-4xl sm:text-6xl font-black text-white drop-shadow-lg mb-4">
                  {formatCurrency(coin.current_price)}
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-base sm:text-lg font-bold border ${isUp24h ? 'bg-crypto-green/10 text-crypto-green border-crypto-green/30 text-glow-green' : 'bg-crypto-red/10 text-crypto-red border-crypto-red/30 text-glow-red'}`}>
                  {isUp24h ? <TrendingUp size={24} className="mr-2" /> : <TrendingDown size={24} className="mr-2" />}
                  {isUp24h ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}% (24h)
                </div>
            </div>
        </div>
      </div>

      {/* Wykres Historyczny */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-12 mb-4 gap-4">
         <h2 className="text-2xl font-bold text-white flex items-center">
            <BarChart2 className="mr-3 text-crypto-primary" /> Wykres Historyczny
         </h2>
         <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-800 self-start sm:self-auto">
            {[
              { label: '24h', value: 1 },
              { label: '7D', value: 7 },
              { label: '30D', value: 30 },
              { label: '1Y', value: 365 },
            ].map(tf => (
               <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeframe === tf.value ? 'bg-crypto-primary text-gray-900 shadow-[0_0_10px_rgba(0,212,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
               >
                  {tf.label}
               </button>
            ))}
         </div>
      </div>
      <div className="card p-4 sm:p-6 w-full h-[400px] border border-crypto-primary/10">
        {isChartLoading ? (
           <div className="w-full h-full flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
           </div>
        ) : chartData.length > 0 ? (
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                   {isChartUp 
                      ? <><stop offset="5%" stopColor="#00E676" stopOpacity={0.8}/><stop offset="95%" stopColor="#00E676" stopOpacity={0}/></>
                      : <><stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8}/><stop offset="95%" stopColor="#ff4d4f" stopOpacity={0}/></>
                   }
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis 
                  dataKey="dateLabelX" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                  tickMargin={12}
                  minTickGap={45}
               />
               <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                  tickFormatter={(val) => '$' + val.toLocaleString()}
                  width={80}
                  orientation="right"
               />
               <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.95)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '12px', boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#00d4ff', marginBottom: '4px' }}
                  formatter={(value) => [formatCurrency(value), 'Cena']}
                  labelFormatter={(_label, payload) => {
                     if (payload && payload.length > 0) {
                        return payload[0].payload.dateLabelTooltip;
                     }
                     return _label;
                  }}
               />
               <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isChartUp ? '#00E676' : '#ff4d4f'} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
               />
             </AreaChart>
           </ResponsiveContainer>
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
             Brak danych wykresu dla tej pory.
           </div>
        )}
      </div>

      {/* Siatka Statystyk */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-12 flex items-center">
         <Activity className="mr-3 text-crypto-primary" /> Szczegółowe Statystyki i Rynek
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* 1 */}
         <div className="card p-6 border-l-4 border-crypto-purple hover:-translate-y-1 transition-transform overflow-hidden">
             <div className="flex items-center text-gray-400 mb-2 whitespace-nowrap">
                 <PieChart size={18} className="mr-2 text-crypto-purple flex-shrink-0" />
                 <span className="text-sm font-medium uppercase tracking-wider truncate">Kapitalizacja (Limit)</span>
             </div>
             <div className="text-2xl font-bold text-white truncate" title={formatCurrency(coin.market_cap)}>{formatCurrency(coin.market_cap)}</div>
             <div className="text-xs text-gray-500 mt-1">Market Cap</div>
         </div>
         
         {/* 2 */}
         <div className="card p-6 border-l-4 border-crypto-green hover:-translate-y-1 transition-transform overflow-hidden">
             <div className="flex items-center text-gray-400 mb-2 whitespace-nowrap">
                 <DollarSign size={18} className="mr-2 text-crypto-green flex-shrink-0" />
                 <span className="text-sm font-medium uppercase tracking-wider truncate">Wolumen (24h)</span>
             </div>
             <div className="text-2xl font-bold text-white truncate" title={formatCurrency(coin.total_volume)}>{formatCurrency(coin.total_volume)}</div>
             <div className="text-xs text-gray-500 mt-1">Total Volume</div>
         </div>

         {/* 3 */}
         <div className="card p-6 border-l-4 border-crypto-primary hover:-translate-y-1 transition-transform overflow-hidden">
             <div className="flex items-center text-gray-400 mb-2 whitespace-nowrap">
                 <TrendingUp size={18} className="mr-2 text-crypto-primary flex-shrink-0" />
                 <span className="text-sm font-medium uppercase tracking-wider truncate">H Najwyższa (24h)</span>
             </div>
             <div className="text-2xl font-bold text-gray-200 truncate" title={formatCurrency(coin.high_24h)}>{formatCurrency(coin.high_24h)}</div>
         </div>

         {/* 4 */}
         <div className="card p-6 border-l-4 border-crypto-red hover:-translate-y-1 transition-transform overflow-hidden">
             <div className="flex items-center text-gray-400 mb-2 whitespace-nowrap">
                 <TrendingDown size={18} className="mr-2 text-crypto-red flex-shrink-0" />
                 <span className="text-sm font-medium uppercase tracking-wider truncate">L Najniższa (24h)</span>
             </div>
             <div className="text-2xl font-bold text-gray-200 truncate" title={formatCurrency(coin.low_24h)}>{formatCurrency(coin.low_24h)}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
         {/* ATH */}
         <div className="card p-6 bg-gradient-to-br from-gray-900/80 to-crypto-card relative overflow-hidden">
             <div className="flex items-center text-gray-400 mb-4">
                 <Star size={20} className="mr-2 text-crypto-yellow" />
                 <span className="text-sm font-bold uppercase tracking-wider">All Time High (ATH)</span>
             </div>
             <div className="text-3xl font-black text-white mb-2">{formatCurrency(coin.ath)}</div>
             <div className={`text-sm font-bold flex items-center mb-4 ${isUpATH ? 'text-crypto-green' : 'text-crypto-red'}`}>
                  {isUpATH ? 'Ponad ATH: ' : 'Od ATH: '} {coin.ath_change_percentage?.toFixed(2)}%
             </div>
             <div className="text-xs text-gray-500">
                  Data rekordu: {coin.ath_date ? new Date(coin.ath_date).toLocaleDateString('pl-PL') : 'Brak danych'}
             </div>
         </div>

         {/* ATL */}
         <div className="card p-6 bg-gradient-to-br from-gray-900/80 to-crypto-card relative overflow-hidden">
             <div className="flex items-center text-gray-400 mb-4">
                 <Info size={20} className="mr-2 text-gray-500" />
                 <span className="text-sm font-bold uppercase tracking-wider">All Time Low (ATL)</span>
             </div>
             <div className="text-3xl font-black text-white mb-2">{formatCurrency(coin.atl)}</div>
             <div className={`text-sm font-bold flex items-center mb-4 ${isUpATL ? 'text-crypto-green' : 'text-crypto-red'}`}>
                  {isUpATL ? 'Od ATL: ' : 'Poniżej ATL: '} +{coin.atl_change_percentage?.toLocaleString(undefined, { maximumFractionDigits: 0})}%
             </div>
             <div className="text-xs text-gray-500">
                  Data dołka: {coin.atl_date ? new Date(coin.atl_date).toLocaleDateString('pl-PL') : 'Brak danych'}
             </div>
         </div>
      </div>

      {/* Podaż */}
      <div className="card p-8 mt-4 border border-gray-800">
         <div className="flex items-center text-gray-300 mb-6">
            <Layers size={22} className="mr-3 text-crypto-primary" />
            <h3 className="text-xl font-bold uppercase tracking-widest">Zasoby i Podaż (Supply)</h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">W Obiegu (Circulating)</p>
               <p className="text-xl font-medium text-gray-100">{coin.circulating_supply?.toLocaleString() || 'Brak danych'}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Całkowita (Total)</p>
               <p className="text-xl font-medium text-gray-100">{coin.total_supply?.toLocaleString() || 'Brak danych'}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Maksymalna (Max)</p>
               <p className="text-xl font-medium text-gray-100">{coin.max_supply?.toLocaleString() || 'Bez limitu (Brak danych)'}</p>
            </div>
         </div>
         {coin.max_supply && coin.circulating_supply && (
           <div className="mt-6">
             <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className="bg-crypto-primary h-2.5 rounded-full" style={{ width: `${(coin.circulating_supply / coin.max_supply) * 100}%` }}></div>
             </div>
             <p className="text-right text-xs text-gray-500 mt-2">{((coin.circulating_supply / coin.max_supply) * 100).toFixed(1)}% wykopane</p>
           </div>
         )}
      </div>

    </div>
  );
};

export default CryptoDetailPage;
