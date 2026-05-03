import { create } from 'zustand';

/**
 * useAuthStore — slim Zustand store TYLKO dla auth state.
 * Token trzymany w pamięci (nie czytamy z localStorage przy każdym requeście).
 * Wszystkie dane z API zarządzane są przez TanStack Query w src/hooks/queries.js.
 */
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('crypto_pulse_user')) || null,
  // Token w pamięci — czytany raz przy starcie, potem tylko z RAM
  token: localStorage.getItem('crypto_pulse_token') || null,

  setUser: (user, token) => {
    localStorage.setItem('crypto_pulse_user', JSON.stringify(user));
    localStorage.setItem('crypto_pulse_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('crypto_pulse_token');
    localStorage.removeItem('crypto_pulse_user');
    set({ user: null, token: null });
  },
}));
