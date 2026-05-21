import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ponów request 1 raz przed pokazaniem błędu (domyślnie 3)
      retry: 1,
      // refetchOnWindowFocus: true (domyślne) — krypto to live market!
      // staleTime w każdym query chroni przed rate limitami:
      // jeśli dane są świeże, TanStack Query NIE wyśle nowego requesta po focus.
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  </React.StrictMode>,
)
