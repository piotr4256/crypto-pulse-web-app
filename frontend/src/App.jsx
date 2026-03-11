import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MarketPage from './pages/MarketPage';
import WatchlistPage from './pages/WatchlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CryptoDetailPage from './pages/CryptoDetailPage';
import ExchangesPage from './pages/ExchangesPage';
import TrendingPage from './pages/TrendingPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MarketPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/coin/:id" element={<CryptoDetailPage />} />
          <Route path="/exchanges" element={<ExchangesPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
