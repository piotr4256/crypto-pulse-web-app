import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.jsx'
import './index.css'

// Inicjalizacja klienta TanStack Query z konfiguracją globalną
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Ponów nieudane zapytanie HTTP tylko raz (zamiast domyślnych 3), oszczędzając limit API
    },
  },
});

// Renderowanie aplikacji React bezpośrednio w elemencie <div id="root"> w index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Uruchomienie QueryClientProvider, aby cała aplikacja miała dostęp do cache zapytań */}
    <QueryClientProvider client={queryClient}>

      {/* Główny komponent z systemem routingu */}
      <App />

      {/* Deweloperski panel kontrolny TanStack Query (widoczny tylko lokalnie podczas pracy) */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />

    </QueryClientProvider>
  </React.StrictMode>,
)
