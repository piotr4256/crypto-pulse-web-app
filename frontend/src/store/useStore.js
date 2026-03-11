import { create } from 'zustand';
import { apiService } from '../api/apiService';

export const useStore = create((set, get) => ({
  user: null,
  watchlist: [],
  marketData: [],
  exchanges: [],
  trending: [],
  globalStats: null,
  isLoading: false,
  error: null,

  fetchMarketData: async () => {
    const { marketData, isLoading } = get();
    if (marketData.length > 0 || isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await apiService.getAllCryptos();
      set({ marketData: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchExchanges: async () => {
    const { exchanges, isLoading } = get();
    if (exchanges.length > 0 || isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await apiService.getExchanges(1);
      set({ exchanges: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTrendingAndGlobal: async () => {
    const { trending, globalStats, isLoading } = get();
    if ((trending.length > 0 && globalStats) || isLoading) return;

    set({ isLoading: true, error: null });
    try {
        const [trendRes, globRes] = await Promise.all([
           apiService.getTrending(),
           apiService.getGlobalStats()
        ]);
        set({ trending: trendRes.data, globalStats: globRes.data, isLoading: false });
    } catch(err) {
        set({ error: err.message, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(email, password);
      // After login, fetch watchlist for this user
      const wlRes = await apiService.getUserWatchlist(response.data.id);
      set({ user: response.data, watchlist: wlRes.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.register(email, password);
      const wlRes = await apiService.getUserWatchlist(response.data.id);
      set({ user: response.data, watchlist: wlRes.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    set({ user: null, watchlist: [] });
  },

  fetchWatchlist: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const resp = await apiService.getUserWatchlist(user.id);
      set({ watchlist: resp.data });
    } catch (err) {
      console.error('Failed to fetch watchlist', err);
    }
  },

  toggleWatchlist: async (cryptoId) => {
    const { watchlist, user } = get();
    if (!user) return; // Must be logged in

    const isFaved = watchlist.includes(cryptoId);
    try {
      if (isFaved) {
        // optimistically update? Or rely on API. Let's rely on API
        const resp = await apiService.removeFromWatchlist(cryptoId);
        set({ watchlist: resp.data.watchlist });
      } else {
        const resp = await apiService.addToWatchlist(cryptoId);
        set({ watchlist: resp.data.watchlist });
      }
    } catch (err) {
      console.error('Watchlist toggle failed', err);
    }
  }
}));
