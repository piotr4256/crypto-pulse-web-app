import { create } from 'zustand';
import { apiService } from '../api/apiService';

export const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('crypto_pulse_user')) || null, // Persystencja użytkownika po odświeżeniu
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
        const [trendRes, globRes] = await Promise.allSettled([
           apiService.getTrending(),
           apiService.getGlobalStats()
        ]);
        
        let newTrending = trending;
        let newGlobal = globalStats;
        
        if (trendRes.status === 'fulfilled') {
            newTrending = trendRes.value.data;
        }
        if (globRes.status === 'fulfilled') {
            newGlobal = globRes.value.data;
        }

        set({ trending: newTrending, globalStats: newGlobal, isLoading: false });
    } catch(err) {
        set({ error: err.message, isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(username, password);
      // Dalsza logika po sukcesie z API
      const { user, token } = response.data;
      
      localStorage.setItem('crypto_pulse_token', token);
      localStorage.setItem('crypto_pulse_user', JSON.stringify(user));
      
      // Pobieranie prawdziwej watchlisty
      const wlRes = await apiService.getUserWatchlist();
      set({ user: user, watchlist: wlRes.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.register(username, email, password);
      const { user, token } = response.data;
      
      localStorage.setItem('crypto_pulse_token', token);
      localStorage.setItem('crypto_pulse_user', JSON.stringify(user));
      
      const wlRes = await apiService.getUserWatchlist();
      set({ user: user, watchlist: wlRes.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('crypto_pulse_token');
    localStorage.removeItem('crypto_pulse_user');
    set({ user: null, watchlist: [] });
  },

  fetchWatchlist: async () => {
    const { user } = get();
    if (!user) return; // Zapobiega pytaniom, kiedy niezalogowany
    try {
      const resp = await apiService.getUserWatchlist();
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
        // Optymistycznie usuwamy z Local State, potem wysyłamy do API
        set({ watchlist: watchlist.filter(id => id !== cryptoId) });
        await apiService.removeFromWatchlist(cryptoId);
      } else {
        // Optymistycznie dodajemy do Local State, potem wysyłamy do API
        set({ watchlist: [...watchlist, cryptoId] });
        await apiService.addToWatchlist(cryptoId);
      }
    } catch (err) {
      console.error('Watchlist toggle failed', err);
      // Opcjonalnie: w razie błędu przywracać stary stan
      get().fetchWatchlist();
    }
  }
}));
