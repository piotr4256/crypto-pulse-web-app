import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useAuthStore — slim Zustand store TYLKO dla auth state.
 * Middleware `persist` automatycznie synchronizuje stan z localStorage
 * pod kluczem 'crypto_pulse_auth' — eliminuje ręczne getItem/setItem/removeItem.
 * Token dostępny synchronicznie przez useAuthStore.getState().token (używane w apiService.js).
 */
export const useAuthStore = create(
  // Middleware persist: automatycznie zapisuje i odczytuje stan z localStorage przeglądarki
  persist(
    (set) => ({
      // Stan poczatkowy (domyślnie użytkownik niezalogowany)
      user: null,
      token: null,

      // Akcja logowania: ustawia dane użytkownika i token JWT
      setUser: (user, token) => set({
        user: user || null,
        token: token || null,
      }),

      // Akcja wylogowania: zeruje stan (automatycznie usunie dane z localStorage)
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'crypto_pulse_auth', // Klucz pod jakim stan będzie zapisany w localStorage przeglądarki
      partialize: (state) => ({  // Zapisujemy tylko dane (user i token), pomijamy funkcje akcji
        user: state.user,
        token: state.token,
      }),
    }
  )
);
