import { create } from 'zustand';

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem('crypto_pulse_user');
    if (!userStr || userStr === 'undefined') return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Błąd parsowania użytkownika z localStorage:', error);
    return null;
  }
};

const getInitialToken = () => {
  const token = localStorage.getItem('crypto_pulse_token');
  if (!token || token === 'undefined') return null;
  return token;
};

/**
 * useAuthStore — slim Zustand store TYLKO dla auth state.
 * Token trzymany w pamięci (nie czytamy z localStorage przy każdym requeście).
 * Wszystkie dane z API zarządzane są przez TanStack Query w src/hooks/queries.js.
 */
export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),

  setUser: (user, token) => {
    if (user) {
      localStorage.setItem('crypto_pulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('crypto_pulse_user');
    }

    if (token) {
      localStorage.setItem('crypto_pulse_token', token);
    } else {
      localStorage.removeItem('crypto_pulse_token');
    }

    set({ user: user || null, token: token || null });
  },

  logout: () => {
    localStorage.removeItem('crypto_pulse_token');
    localStorage.removeItem('crypto_pulse_user');
    set({ user: null, token: null });
  },
}));
