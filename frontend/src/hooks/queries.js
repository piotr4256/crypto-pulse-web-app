import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api/apiService';

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralizacja kluczy cache — ułatwia invalidation i refetch
export const QUERY_KEYS = {
  markets: ['markets'],
  exchanges: ['exchanges'],
  trending: ['trending'],
  globalStats: ['globalStats'],
  watchlist: ['watchlist'],
  coinChart: (id, days) => ['coinChart', id, days],
};

// ─── Market Data ──────────────────────────────────────────────────────────────
export const useMarketQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.markets,
    queryFn: async () => {
      const res = await apiService.getAllCryptos();
      return res.data;
    },
    staleTime: 60_000,      // dane świeże przez 1 minutę
    gcTime: 5 * 60_000,  // cache żyje 5 minut po ostatnim użyciu
    refetchInterval: 30_000, // Automatyczne odświeżanie co 30 sekund
  });

// ─── Exchanges ────────────────────────────────────────────────────────────────
export const useExchangesQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.exchanges,
    queryFn: async () => {
      const res = await apiService.getExchanges();
      return res.data;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

// ─── Trending ─────────────────────────────────────────────────────────────────
export const useTrendingQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.trending,
    queryFn: async () => {
      const res = await apiService.getTrending();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

// ─── Global Stats ─────────────────────────────────────────────────────────────
export const useGlobalStatsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.globalStats,
    queryFn: async () => {
      const res = await apiService.getGlobalStats();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const useWatchlistQuery = (user) =>
  useQuery({
    queryKey: QUERY_KEYS.watchlist,
    queryFn: async () => {
      const res = await apiService.getUserWatchlist();
      return res.data; // string[] z coin_id
    },
    enabled: !!user,    // fetch tylko gdy user jest zalogowany
    staleTime: 2 * 60_000,
  });

export const useToggleWatchlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cryptoId, isFaved }) => {
      if (isFaved) {
        await apiService.removeFromWatchlist(cryptoId);
      } else {
        await apiService.addToWatchlist(cryptoId);
      }
    },
    // Optimistic update — natychmiast aktualizuje UI bez czekania na serwer
    onMutate: async ({ cryptoId, isFaved }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.watchlist });
      const previous = queryClient.getQueryData(QUERY_KEYS.watchlist) ?? [];
      queryClient.setQueryData(
        QUERY_KEYS.watchlist,
        isFaved ? previous.filter(id => id !== cryptoId) : [...previous, cryptoId]
      );
      return { previous };
    },
    // Rollback przy błędzie
    onError: (_, __, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(QUERY_KEYS.watchlist, ctx.previous);
      }
    },
    // Zawsze resynkronizuj z serwerem po zakończeniu
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchlist });
    },
  });
};

// ─── Coin Chart ───────────────────────────────────────────────────────────────
export const useCoinChartQuery = (id, days) =>
  useQuery({
    queryKey: QUERY_KEYS.coinChart(id, days),
    queryFn: async () => {
      const res = await apiService.getMarketChart(id, days);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

// ─── Auth Mutations ───────────────────────────────────────────────────────────
export const useLoginMutation = () =>
  useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await apiService.login(username, password);
      return res.data; // { user, token }
    },
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: async ({ username, email, password }) => {
      const res = await apiService.register(username, email, password);
      return res.data; // { user, token }
    },
  });
