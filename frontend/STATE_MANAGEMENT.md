# Zarządzanie Stanem — CryptoPulse Frontend

> **Data aktualizacji:** 20.05.2026  
> **Dotyczy:** `frontend/src/`

---

## Architektura ogólna

Frontend CryptoPulse używa **trzech warstw stanu**, z których każda odpowiada za inny rodzaj danych:

| Warstwa | Technologia | Rodzaj danych | Trwałość |
|---|---|---|---|
| Auth State | Zustand + persist | user, JWT token | Przeżywa zamknięcie karty |
| Server State | TanStack Query | Kursy, giełdy, watchlista | Do wygaśnięcia cache (RAM) |
| Persystencja | localStorage | Tylko auth (przez persist) | Do ręcznego wyczyszczenia |

---

## Warstwa 1: Zustand + persist middleware

**Plik:** `src/store/useStore.js`

### Co przechowuje?

Stan **sesji uwierzytelnienia** zalogowanego użytkownika:

| Pole | Typ | Opis |
|---|---|---|
| `user` | `object \| null` | Dane użytkownika (`id`, `username`, `email`) |
| `token` | `string \| null` | JWT Access Token do autoryzacji żądań API |

### Jak działa?

```js
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user: user || null, token: token || null }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'crypto_pulse_auth', // klucz w localStorage
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

Middleware `persist` automatycznie:
- **Przy starcie aplikacji:** deserializuje stan z `localStorage['crypto_pulse_auth']` i hydratuje store
- **Przy każdym `set()`:** serializuje i zapisuje `user` + `token` do localStorage
- **Przy `logout()`:** `set({ user: null, token: null })` — persist zapisuje null do localStorage

> **Dlaczego `partialize`?** Wskazuje, które pola persystować. Funkcje (`setUser`, `logout`) są wykluczone — nie mają sensu w localStorage i nie dałoby się ich poprawnie zserializować.

### Cykl życia sesji

```
1. Logowanie     → LoginPage wywołuje setUser(user, token)
                 → persist automatycznie zapisuje do localStorage

2. Powrót        → aplikacja startuje od nowa
                 → persist czyta z localStorage i hydratuje store
                 → użytkownik nadal zalogowany bez ponownego logowania

3. Request API   → apiService.js interceptor Axios
                 → useAuthStore.getState().token
                 → Authorization: Bearer eyJ...  (wysyłane z każdym żądaniem)

4. Wylogowanie   → logout() → set({ user: null, token: null })
                 → persist zapisuje null do localStorage
                 → queryClient.clear() czyści cały cache TanStack Query
```

### Gdzie używany?

| Plik | Jak używa |
|---|---|
| `Navbar.jsx` | Wyświetla `user.email`, obsługuje "Wyloguj" + `queryClient.clear()` |
| `MarketPage.jsx` | Przekazuje `user` do query/mutation watchlisty |
| `FavoritesPage.jsx` | j.w. |
| `CryptoDetailPage.jsx` | j.w. |
| `LoginPage.jsx` | Wywołuje `setUser(data.user, data.token)` po zalogowaniu |
| `apiService.js` | Czyta token przez `useAuthStore.getState().token` w interceptorze |

---

## Warstwa 2: TanStack Query

**Plik:** `src/hooks/queries.js`

### Co przechowuje?

Wszystkie dane asynchroniczne z API. Żyją w RAM przeglądarki i są automatycznie zarządzane przez bibliotekę.

### Klucze cache i konfiguracja

| Query Hook | Klucz cache | staleTime | refetchInterval | Uwagi |
|---|---|---|---|---|
| `useMarketQuery()` | `['markets']` | 60s | **30s** | Automatyczne odświeżanie kurów |
| `useExchangesQuery()` | `['exchanges']` | 5 min | — | |
| `useTrendingQuery()` | `['trending']` | 5 min | — | |
| `useGlobalStatsQuery()` | `['globalStats']` | 5 min | — | |
| `useWatchlistQuery(user)` | `['watchlist', userId]` | 2 min | — | Fetch tylko gdy `user != null` |
| `useCoinChartQuery(id, days)` | `['coinChart', id, days]` | 5 min | — | Fetch tylko gdy `id != null` |

> **Kluczowa decyzja architektoniczna:** Klucz `watchlist` zawiera `userId`.  
> Dzięki temu cache konta A (`['watchlist', 1]`) nigdy nie zostanie serwowany kontu B (`['watchlist', 2]`).  
> To rozwiązuje problem "wyciekania" ulubionych między kontami.

### Mutacje — Toggle Watchlist

```
useToggleWatchlistMutation(user)
  │
  ├── mutationFn → HTTP DELETE lub POST do /api/watchlist/
  │
  ├── onMutate  → Optimistic update:
  │               cancelQueries  — zatrzymuje ewentualny in-flight refetch
  │               setQueryData   — natychmiastowo odwraca stan gwiazdki w UI
  │               return { previous } — zachowuje stan do ewentualnego rollbacku
  │
  ├── onError   → Rollback:
  │               setQueryData(watchlistKey, ctx.previous)
  │               Przywraca poprzedni stan gdy serwer zwróci błąd
  │
  └── onSettled → invalidateQueries(watchlistKey)
                  Wymusza refetch z serwera — ostateczna synchronizacja
```

### Korzyści z TanStack Query vs ręczny fetch

| Funkcja | Ręczny fetch+useState | TanStack Query |
|---|---|---|
| Loading/error state | Ręcznie w każdym komponencie | Automatycznie |
| Cache | Brak (każdy komponent osobno) | Globalny, współdzielony |
| Deduplikacja requestów | Brak | Automatyczna |
| Optimistic updates | Kompleksowy kod | `onMutate` + `onError` |
| Auto-refetch | Ręczny setInterval | `refetchInterval` |
| Synchronizacja między komponentami | Prop drilling lub Context | Przez klucz cache |

---

## Warstwa 3: localStorage (zarządzany przez persist)

### Klucz i struktura

Persist zapisuje dane pod jednym kluczem `crypto_pulse_auth`:

```json
{
  "state": {
    "user": {
      "id": 5,
      "username": "piotr",
      "email": "piotr@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "version": 0
}
```

### Czego NIE ma w localStorage?

- Danych rynkowych (kursy, giełdy, wykresy) — tylko w TanStack Query cache (RAM)
- Watchlisty — tylko w TanStack Query cache (RAM) + baza Supabase (source of truth)
- Sesji po stronie serwera — Django jest całkowicie bezstanowy

---

## Bezstanowość komunikacji (REST)

Zasada bezstanowości dotyczy **serwera**, nie klienta. Django nie przechowuje żadnej sesji. Każde żądanie musi być samowystarczalne:

```
GET /api/watchlist/ HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      ↑
                      Token zawiera: kto to jest, uprawnienia, kiedy wygasa.
                      Serwer nie pamięta poprzednich żądań.
```

localStorage, Zustand i TanStack Query to wyłącznie **stan klienta** i nie naruszają zasady bezstanowości REST.

---

## Czyszczenie stanu przy wylogowaniu

Wylogowanie czyści **wszystkie trzy warstwy** jednocześnie:

```js
// Navbar.jsx — handleLogout()
logout();              // Zustand: user=null, token=null
                       // persist: localStorage['crypto_pulse_auth'] → null

queryClient.clear();   // TanStack: usuwa CAŁY cache ze wszystkich kluczy

navigate('/login');    // Przekierowanie
```

Dzięki temu po zalogowaniu się na nowe konto:
1. Brak starych danych w cache
2. Nowy `userId` → nowy klucz `['watchlist', newUserId]`
3. TanStack Query pobiera świeże dane tylko dla nowego użytkownika

---

## Szybki przewodnik

| Pytanie | Gdzie szukać |
|---|---|
| Kto jest zalogowany? | `const { user } = useAuthStore()` |
| Jaki jest JWT token? | `useAuthStore.getState().token` |
| Kursy kryptowalut? | `const { data } = useMarketQuery()` |
| Ulubione użytkownika? | `const { data } = useWatchlistQuery(user)` |
| Dodaj/usuń z ulubionych? | `const m = useToggleWatchlistMutation(user)` → `m.mutate({ cryptoId, isFaved })` |
| Dane trwałe po zamknięciu? | `localStorage['crypto_pulse_auth']` (tylko auth) |
| Wyczyść wszystko? | `logout()` + `queryClient.clear()` |
