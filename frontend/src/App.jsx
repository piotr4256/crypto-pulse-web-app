import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MarketPage from './pages/MarketPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CryptoDetailPage from './pages/CryptoDetailPage';
import ExchangesPage from './pages/ExchangesPage';
import TrendingPage from './pages/TrendingPage';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MarketPage />} />
          <Route path="/ulubione" element={<FavoritesPage />} />
          <Route path="/coin/:id" element={<CryptoDetailPage />} />
          <Route path="/exchanges" element={<ExchangesPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
