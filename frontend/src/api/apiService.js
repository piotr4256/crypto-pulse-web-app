import axios from 'axios';

const isProd = import.meta.env.PROD;
const LOCAL_DJANGO_URL = 'http://127.0.0.1:8000/api';
const PROD_DJANGO_URL = 'https://crypto-pulse-web-app.onrender.com/api';

const BASE_URL = isProd ? PROD_DJANGO_URL : LOCAL_DJANGO_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Interceptor do automatycznego wstrzykiwania tokenu do autoryzowanych ścieżek
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('crypto_pulse_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const apiService = {
  login: async (username, password) => {
    try {
      // Endpoint DRF ObtainAuthToken odbiera domyślnie 'username' i 'password'
      const response = await apiClient.post('/login/', { username, password });
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.non_field_errors?.[0] || 'Niepoprawne dane logowania');
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/register/', { username, email, password });
      return { data: response.data };
    } catch (error) {
       // Odbieranie ewentualnych błędów z Django (np. nazwa zajęta)
      const errs = error.response?.data;
      const msg = errs ? Object.values(errs).flat()[0] : 'Błąd rejestracji';
      throw new Error(msg);
    }
  },

  getAllCryptos: async () => {
    try {
      const response = await apiClient.get('/markets/');
      return { data: response.data };
    } catch (error) {
      console.error('Błąd pobierania danych:', error);
      throw new Error('Nie udało się pobrać danych z rynku. Spróbuj ponownie później.');
    }
  },

  getCoinDetails: async (id) => {
    try {
      const response = await apiClient.get(`/coins/${id}/`);
      return { data: response.data };
    } catch (error) {
      console.error(`Błąd pobierania szczegółów dla ${id}:`, error);
      throw new Error('Nie udało się pobrać szczegółów kryptowaluty.');
    }
  },

  getMarketChart: async (id, days = 7) => {
    try {
      const response = await apiClient.get(`/coins/${id}/chart/`);
      return { data: response.data };
    } catch (error) {
      console.error(`Błąd pobierania wykresu dla ${id}:`, error);
      throw new Error('Nie udało się pobrać wykresu cenowego.');
    }
  },

  getExchanges: async (page = 1) => {
    try {
      const response = await apiClient.get('/exchanges/');
      return { data: response.data };
    } catch (error) {
      console.error('Błąd pobierania giełd:', error);
      throw new Error('Nie udało się pobrać listy giełd.');
    }
  },

  getTrending: async () => {
    try {
      const response = await apiClient.get('/trending/');
      return { data: response.data.coins || response.data };
    } catch (error) {
      console.error('Błąd pobierania trendków:', error);
      throw new Error('Nie udało się pobrać najnowszych trendów.');
    }
  },

  getGlobalStats: async () => {
    try {
      const response = await apiClient.get('/global/');
      return { data: response.data.data || response.data };
    } catch (error) {
      console.error('Błąd pobierania statystyk globalnych:', error);
      throw new Error('Nie udało się pobrać danych globalnych.');
    }
  },

  getUserWatchlist: async () => {
    try {
      const response = await apiClient.get('/watchlist/');
      // Mapujemy z tabeli BD na samą tablicę stringów z id monet, np. ['bitcoin', 'solana']
      return { data: response.data.map(item => item.coin_id) }; 
    } catch (error) {
      console.error('Błąd pobierania watchlisty:', error);
      return { data: [] };
    }
  },

  addToWatchlist: async (cryptoId) => {
    try {
      await apiClient.post('/watchlist/', { coin_id: cryptoId });
      // Zwracamy po prostu info że się udało. Pamiętaj, że Backend nie odświeża całej listy w POST
      return { data: { success: true } };
    } catch (error) {
      console.error('Nie udało się dodać do ulubionych', error);
      throw error;
    }
  },

  removeFromWatchlist: async (cryptoId) => {
    try {
      // DRF udostępnia usuwanie na postawie ID. Ponieważ mamy ID elementu listy, a znamy 'coin_id', musimy podać coin_id.
      // Czekaj - standardowy ModelViewSet usuwa po 'id' zasobu (PK), nie po 'coin_id'!
      // Ale nie mamy PK w state? Wtedy usunąć to po ID jest niemożliwie! Trzeba zrobić lookup. 
      // Zaraz to naprawię dopisując customowy DELETE viewset w backendzie lub pobierając z pamięci PK by usunąć!
      let items = await apiClient.get('/watchlist/');
      let target = items.data.find(x => x.coin_id === cryptoId);
      if (target) {
        await apiClient.delete(`/watchlist/${target.id}/`);
      }
      return { data: { success: true } };
    } catch (error) {
      console.error('Błąd usuwania z ulubionych:', error);
      throw error;
    }
  }
};
