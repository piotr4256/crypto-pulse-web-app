import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useMarketQuery, useWatchlistQuery, useToggleWatchlistMutation } from '../hooks/queries';
import { useDebounceValue } from 'usehooks-ts';
import { Star, TrendingUp, TrendingDown, Search } from 'lucide-react';
import PortfolioSection from '../components/PortfolioSection';
import AnimatedHeroTitle from '../components/AnimatedHeroTitle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

// ─── Column Definitions ───────────────────────────────────────────────────────
const columns = [
  {
    id: 'star',
    header: '',
    enableSorting: false,
    size: 48,
  },
  {
    accessorKey: 'name',
    header: 'Nazwa',
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'current_price',
    header: 'Cena',
    sortingFn: 'basic',
    meta: { align: 'right' },
  },
  {
    accessorKey: 'price_change_percentage_24h',
    header: 'Zmiana 24h',
    sortingFn: 'basic',
    meta: { align: 'right' },
  },
];

const MarketPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [sorting, setSorting] = useState([]);

  // Fix #3: Debounce — przeliczanie filtra dopiero 300ms po zaprzestaniu pisania
  const [searchTerm] = useDebounceValue(searchInput, 300);

  const { user } = useAuthStore();
  const { data: cryptos = [], isLoading: loading, error: queryError } = useMarketQuery();
  const { data: watchlist = [] } = useWatchlistQuery(user);
  const toggleMutation = useToggleWatchlistMutation();
  const navigate = useNavigate();

  const error = queryError?.message;

  const handleToggleStar = (e, cryptoId) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    toggleMutation.mutate({ cryptoId, isFaved: watchlist.includes(cryptoId) });
  };

  // Fix #2: TanStack Table — brak ręcznego useMemo z if-ami
  const table = useReactTable({
    data: cryptos,
    columns,
    state: { sorting, globalFilter: searchTerm },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _colId, filterValue) => {
      const val = filterValue.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(val) ||
        row.original.symbol.toLowerCase().includes(val)
      );
    },
  });

  const getSortIndicator = (column) => {
    if (!column.getCanSort()) return null;
    const sorted = column.getIsSorted();
    if (!sorted) return <span className="ml-1 opacity-30">⇅</span>;
    return sorted === 'asc'
      ? <span className="ml-1 text-crypto-primary">↑</span>
      : <span className="ml-1 text-crypto-primary">↓</span>;
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center justify-center relative z-10 px-2 sm:px-0 mb-12 text-center max-w-6xl mx-auto">
        <AnimatedHeroTitle />
        <p className="text-gray-300 text-lg sm:text-xl md:text-2xl font-medium tracking-wide mt-4">Aktualne kursy i notowania największych walut</p>
      </div>

      <PortfolioSection />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-6 mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Wszystkie <span className="text-crypto-primary text-glow-primary">Kryptowaluty</span>
          </h2>
          <div className="relative w-full max-w-md group mx-auto">
            <div className="absolute inset-0 bg-crypto-primary/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
            <Search className="absolute left-4 top-3.5 text-crypto-primary z-10" size={20} />
            <Input
              type="text"
              placeholder="Szukaj waluty..."
              className="pl-12 py-6 text-lg bg-crypto-card/80 backdrop-blur-md relative z-10 w-full border-white/10 focus-visible:ring-crypto-primary/50 text-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-crypto-card/60 backdrop-blur-xl border border-gray-800/80 hover:box-glow-primary transition-shadow duration-500 rounded-2xl">
          <Table>
            <TableHeader className="bg-gray-900/20">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-gray-800/50 hover:bg-transparent">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className={`text-gray-400 select-none ${header.column.getCanSort() ? 'cursor-pointer hover:text-crypto-primary transition-colors' : ''} ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {getSortIndicator(header.column)}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
                    </div>
                    Ładowanie danych rynkowych...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="bg-red-500/10 rounded-lg p-4 max-w-lg mx-auto border border-red-500/30">
                      <p className="font-medium mb-1 text-red-500">⚠ Błąd pobierania danych</p>
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => {
                  const coin = row.original;
                  const isFaved = watchlist.includes(coin.id);
                  const isUp = coin.price_change_percentage_24h >= 0;
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => navigate(`/coin/${coin.id}`)}
                      className="hover:bg-crypto-primary/10 transition-all cursor-pointer duration-300 group border-gray-800/30 data-[state=selected]:bg-transparent hover:shadow-[inset_4px_0_0_rgba(0,212,255,1)]"
                    >
                      <TableCell>
                        <button
                          onClick={(e) => handleToggleStar(e, coin.id)}
                          className={`transition-colors focus:outline-none focus:ring-2 focus:ring-crypto-primary/50 rounded-full p-1.5 
                          ${isFaved ? 'text-crypto-yellow text-glow-yellow' : 'text-gray-600 group-hover:text-crypto-primary/50'}`}
                        >
                          <Star size={22} fill={isFaved ? 'currentColor' : 'none'} />
                        </button>
                      </TableCell>
                      <TableCell className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center bg-gray-800 overflow-hidden group-hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-shadow duration-300">
                          {coin.image
                            ? <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                            : <span className="text-sm font-bold text-gray-300">{coin.symbol[0]}</span>
                          }
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white group-hover:text-crypto-primary transition-colors">{coin.name}</div>
                          <div className="text-xs text-crypto-primary/70 font-bold uppercase tracking-wider">{coin.symbol}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-gray-100">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end space-x-1.5 font-bold text-lg ${isUp ? 'text-crypto-green text-glow-green' : 'text-crypto-red text-glow-red'}`}>
                          {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">Brak wyników</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
