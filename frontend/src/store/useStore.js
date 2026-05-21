import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useAuthStore — slim Zustand store TYLKO dla auth state.
 * Middleware `persist` automatycznie synchronizuje stan z localStorage
 * pod kluczem 'crypto_pulse_auth' — eliminuje ręczne getItem/setItem/removeItem.
 * Token dostępny synchronicznie przez useAuthStore.getState().token (używane w apiService.js).
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user, token) => set({
        user: user || null,
        token: token || null,
      }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'crypto_pulse_auth', // klucz w localStorage
      partialize: (state) => ({  // persystuj TYLKO dane, nie funkcje
        user: state.user,
        token: state.token,
      }),
    }
  )
);
