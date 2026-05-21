import React, { useState } from 'react';
import { useExchangesQuery } from '../hooks/queries';
import { ShieldAlert, ShieldCheck, Globe } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const columns = [
  { accessorKey: 'trust_score_rank', header: '#', size: 56, meta: { align: 'center' } },
  { accessorKey: 'name', header: 'Giełda', sortingFn: 'alphanumeric' },
  { accessorKey: 'trust_score', header: 'Trust Score', meta: { align: 'center' } },
  { accessorKey: 'trade_volume_24h_btc', header: 'Wolumen 24h (BTC)', meta: { align: 'right' } },
  { accessorKey: 'country', header: 'Lokalizacja', meta: { align: 'right' }, enableSorting: false },
];

const getTrustScoreColor = (score) => {
  if (score >= 9) return 'text-crypto-green text-glow-green';
  if (score >= 6) return 'text-crypto-yellow text-glow-yellow';
  return 'text-crypto-red text-glow-red';
};

const ExchangesPage = () => {
  const { data: exchanges = [], isLoading, error: queryError } = useExchangesQuery();
  const error = queryError?.message;
  const [sorting, setSorting] = useState([{ id: 'trust_score_rank', desc: false }]);

  // Fix #2: TanStack Table — brak ręcznego useMemo z if-ami dla sortowania
  const table = useReactTable({
    data: exchanges,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    <div className="space-y-12 animate-fade-in antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Najlepsze <span className="text-crypto-primary text-glow-primary">Giełdy</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Ranking światowych giełd kryptowalut. Kliknij kolumnę, aby posortować.
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 max-w-6xl mx-auto">
        <div className="overflow-x-auto bg-crypto-card/60 backdrop-blur-xl border border-gray-800/80 hover:box-glow-primary transition-shadow duration-500 rounded-2xl">
          <Table>
            <TableHeader className="bg-gray-900/20">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-gray-800/50 hover:bg-transparent">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className={`text-gray-400 select-none
                        ${header.column.getCanSort() ? 'cursor-pointer hover:text-crypto-primary transition-colors' : ''}
                        ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : ''}
                        ${header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''}`}
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
              {isLoading ? (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
                    </div>
                    Ładowanie rankingów...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="h-24 text-center text-red-500">
                    <div className="bg-red-500/10 rounded-lg p-4 max-w-lg mx-auto border border-red-500/30">
                      <p className="font-medium mb-1">⚠ Błąd pobierania danych</p>
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => {
                  const exchange = row.original;
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => window.open(exchange.url, '_blank')}
                      className="hover:bg-crypto-primary/10 transition-all cursor-pointer duration-300 group border-gray-800/30 data-[state=selected]:bg-transparent hover:shadow-[inset_4px_0_0_rgba(0,212,255,1)]"
                    >
                      <TableCell className="text-center text-gray-500 font-bold">
                        {exchange.trust_score_rank || '-'}
                      </TableCell>
                      <TableCell className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center bg-gray-800 overflow-hidden group-hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-shadow duration-300">
                          {exchange.image
                            ? <img src={exchange.image} alt={exchange.name} className="w-full h-full object-cover" />
                            : <span className="text-sm font-bold text-gray-300">{exchange.name[0]}</span>
                          }
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white group-hover:text-crypto-primary transition-colors">{exchange.name}</div>
                          <div className="text-xs text-crypto-primary/70 font-bold">{exchange.year_established ? `Rok: ${exchange.year_established}` : 'Nieznana data'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`font-black border-none text-sm px-2 py-1 bg-black/40 ${getTrustScoreColor(exchange.trust_score)}`}>
                          <div className="flex items-center justify-center gap-1">
                            {exchange.trust_score >= 8 ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                            {exchange.trust_score}/10
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-gray-100">
                        {exchange.trade_volume_24h_btc
                          ? parseFloat(exchange.trade_volume_24h_btc).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' BTC'
                          : 'Brak'
                        }
                      </TableCell>
                      <TableCell className="text-right text-gray-400">
                        <div className="flex items-center justify-end gap-2">
                          <Globe size={16} className="text-gray-500 group-hover:text-crypto-primary/70" />
                          {exchange.country || 'Globalna'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">Brak wyników giełdowych.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ExchangesPage;
