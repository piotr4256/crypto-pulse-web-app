import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="card w-full max-w-md p-8 relative overflow-hidden">
        {/* Neon Glow Effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-crypto-primary via-blue-400 to-crypto-green opacity-75"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Witaj ponownie</h1>
          <p className="text-gray-400">Zaloguj się do swojego portfela Krypto</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-crypto-red/10 border border-crypto-red/20 text-crypto-red rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="Adres e-mail" 
              className="input-field pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Hasło" 
              className="input-field pl-11 pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-crypto-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full py-3 flex justify-center items-center h-12"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Zaloguj się'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Nie masz konta? <Link to="/register" className="text-crypto-primary hover:underline">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
