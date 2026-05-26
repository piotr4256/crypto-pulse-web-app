import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api/apiService';

// Query Keys
// kazde zapytanie do backendu ma swoj klucz cache
// Zapytania useQuery - pobieranie danych (GET)
// Mutacje useMutation - modyfikacja danych (POST, DELETE, PUT)
// dane zaladowane do RAM 
export const QUERY_KEYS = {
  markets: ['markets'],
  exchanges: ['exchanges'],
  trending: ['trending'],
  globalStats: ['globalStats'],
  watchlist: (userId) => ['watchlist', userId],
  coinChart: (id, days) => ['coinChart', id, days],
};

// Market Data
export const useMarketQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.markets,
    queryFn: async () => {
      const res = await apiService.getAllCryptos();
      return res.data;
    },
    staleTime: 60_000,      // czas swiezosci danych, przez ten czas aplikacja nie pobierze nowcyh danych
    gcTime: 5 * 60_000,  // cache żyje 5 minut po ostatnim użyciu
    refetchInterval: 30_000, // autoodswiezanie
  });

// Exchanges
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

// Trending
export const useTrendingQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.trending,
    queryFn: async () => {
      const res = await apiService.getTrending();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

// Global Stats
export const useGlobalStatsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.globalStats,
    queryFn: async () => {
      const res = await apiService.getGlobalStats();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

// Watchlist
export const useWatchlistQuery = (user) =>
  useQuery({
    queryKey: QUERY_KEYS.watchlist(user?.id),
    queryFn: async () => {
      const res = await apiService.getUserWatchlist();
      return res.data; // string[] z coin_id
    },
    enabled: !!user,    // blokuje zapytanie, dopóki user nie jest zalogowany
    staleTime: 2 * 60_000,
  });


//mutacja do usuwania/dodawania do listy obserwowanych
export const useToggleWatchlistMutation = (user) => {
  const queryClient = useQueryClient();
  const watchlistKey = QUERY_KEYS.watchlist(user?.id);
  return useMutation({
    mutationFn: async ({ cryptoId, isFaved }) => {
      if (isFaved) {
        await apiService.removeFromWatchlist(cryptoId);
      } else {
        await apiService.addToWatchlist(cryptoId);
      }
    },
    // Optimistic update — natychmiast aktualizuje UI bez czekania na serwer
    // zmieniamy kolor gwiazdki zanim backend odpowie
    // zapisujemy w pamieci podręcznej co bylo przed zmiana
    onMutate: async ({ cryptoId, isFaved }) => {
      await queryClient.cancelQueries({ queryKey: watchlistKey });
      const previous = queryClient.getQueryData(watchlistKey) ?? [];
      queryClient.setQueryData(
        watchlistKey,
        isFaved ? previous.filter(id => id !== cryptoId) : [...previous, cryptoId]
      );
      return { previous };
    },
    // Rollback przy błędzie
    // cofamy do stanu sprzed mutacji
    onError: (_, __, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(watchlistKey, ctx.previous);
      }
    },
    // sprawdzenie czy na pewno jest zsynchronizowane z serwerem
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKey });
    },
  });
};

// Coin Chart
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

// Auth Mutations
// Mutacja logowania — wywoływana ręcznie z formularza logowania
export const useLoginMutation = () =>
  useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await apiService.login(username, password);
      return res.data; // Zwraca { user, token } z backendu w razie sukcesu
    },
  });

// Mutacja rejestracji — wywoływana ręcznie z formularza rejestracji
export const useRegisterMutation = () =>
  useMutation({
    mutationFn: async ({ username, email, password }) => {
      const res = await apiService.register(username, email, password);
      return res.data; // Zwraca { user, token } z backendu w razie sukcesu
    },
  });
