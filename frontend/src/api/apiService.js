import axios from 'axios';

// Baza do symulacji watchlisty (i logowania)
let MOCK_WATCHLIST = ['bitcoin', 'solana']; // Simulated DB for watchlist

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  login: async (email, password) => {
    await delay(500);
    if (email && password) {
      return { data: { id: 'u1', email, token: 'mock-jwt-token-123' } };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (email, password) => {
    await delay(500);
    if (email && password) {
      return { data: { id: 'u1', email, token: 'mock-jwt-token-123' } };
    }
    throw new Error('Registration failed');
  },

  getAllCryptos: async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false
        }
      });
      return { data: response.data };
    } catch (error) {
      console.error('Błąd pobierania danych z CoinGecko:', error);
      throw new Error('Nie udało się pobrać danych z rynku. Spróbuj ponownie później.');
    }
  },

  getMarketChart: async (id, days = 7) => {
    try {
       const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
         params: { vs_currency: 'usd', days }
       });
       return { data: response.data };
    } catch (error) {
       console.error(`Błąd pobierania wykresu dla ${id}:`, error);
       throw new Error('Nie udało się pobrać wykresu cenowego.');
    }
  },

  getExchanges: async (page = 1) => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/exchanges', {
        params: { per_page: 100, page }
      });
      return { data: response.data };
    } catch (error) {
      console.error('Błąd pobierania giełd:', error);
      throw new Error('Nie udało się pobrać listy giełd.');
    }
  },

  getTrending: async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
      return { data: response.data.coins };
    } catch (error) {
      console.error('Błąd pobierania trendków:', error);
      throw new Error('Nie udało się pobrać najnowszych trendów.');
    }
  },

  getGlobalStats: async () => {
    try {
       const response = await axios.get('https://api.coingecko.com/api/v3/global');
       return { data: response.data.data };
    } catch (error) {
       console.error('Błąd pobierania statystyk globalnych:', error);
       throw new Error('Nie udało się pobrać danych globalnych.');
    }
  },

  getUserWatchlist: async () => {
    await delay(300);
    // In real app, we'd fetch based on userId.
    return { data: MOCK_WATCHLIST };
  },

  addToWatchlist: async (cryptoId) => {
    await delay(200);
    if (!MOCK_WATCHLIST.includes(cryptoId)) {
      MOCK_WATCHLIST.push(cryptoId);
    }
    return { data: { success: true, watchlist: MOCK_WATCHLIST } };
  },

  removeFromWatchlist: async (cryptoId) => {
    await delay(200);
    MOCK_WATCHLIST = MOCK_WATCHLIST.filter(id => id !== cryptoId);
    return { data: { success: true, watchlist: MOCK_WATCHLIST } };
  }
};
