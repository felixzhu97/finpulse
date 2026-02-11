# Mobile Portfolio

Portfolio management mobile app for viewing investment accounts, performance charts, and insights. Part of the fintech-project monorepo.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Expo 54, React 19, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| State | Redux Toolkit (quotes), custom store (portfolio UI) |
| Charts | react-native-wagmi-charts, react-native-chart-kit, react-native-svg |
| Native Charts | iOS Metal (Swift), Android (Kotlin) |
| Navigation | React Navigation (bottom-tabs) |

Native chart components: line, candlestick (K-line), American OHLC, baseline, histogram, line-only, with horizontal scroll and tooltips.

## Main Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/(tabs)/` | Portfolio summary, net worth chart, asset allocation, native line chart |
| Stocks | `/(tabs)/accounts` | Stock list with real-time prices, per-stock sparklines, account summaries; pull-to-refresh |
| Insights | `/(tabs)/insights` | Portfolio risk (high-risk exposure, top 5 concentration), optional server risk metrics (volatility, Sharpe, VaR, beta), bar chart |
| Watchlists | `/(tabs)/watchlists` | Create watchlists, add symbols (draggable drawer), real-time quotes; stock detail drawer with watchlist add/remove (Apple Stocks–style) |
| Profile | `/(tabs)/profile` | User preferences (theme, language, notifications) via `/api/v1/user-preferences` |

## Project Structure (Thin Client)

The app is a **thin client**: business logic lives on the server; the mobile app fetches data and renders UI.

Profile, Watchlists, and Insights also use `useUserPreferences`, `useWatchlists`, `useRiskMetrics` and `customersApi`, `userPreferencesApi`, `watchlistsApi`, `instrumentsApi`, `riskMetricsApi` (REST: customers, user-preferences, watchlists, watchlist-items, instruments, risk-metrics).

- `app/`: expo-router routes and screens.
- `src/api/`: data layer—implements backend contracts (single-layer; no subfolders).
  - `config.ts`: base URL (`EXPO_PUBLIC_PORTFOLIO_API_URL`).
  - `portfolioApi.ts`: GET portfolio (cached), getAccounts, getAccountById, getHoldingsByAccount, getAssetAllocationByAccountType, getPortfolioHistory, getRiskSummary, invalidateCache, seedPortfolio(POST /api/v1/seed).
  - `quotes.ts`: `getQuotes(symbols)` (GET /api/v1/quotes).
  - `quoteSocket.ts`: `createQuoteSocket()` for WebSocket `/ws/quotes`.
  - `customersApi.ts`, `userPreferencesApi.ts`, `watchlistsApi.ts`, `instrumentsApi.ts`, `riskMetricsApi.ts`: REST resources for Profile, Watchlists, Insights.
- `src/types/`: shared interfaces—`portfolio.ts`, `quotes.ts`, `customer.ts`, `userPreference.ts`, `watchlist.ts`, `instrument.ts`, `riskMetrics.ts`; `index.ts` re-exports all.
- `src/hooks/`: `usePortfolio`, `useSymbolDisplayData` (Redux-backed quotes + history for list/drawer), `useRealtimeQuotes`, `usePerSymbolHistory`, `useUserPreferences`, `useWatchlists`, `useRiskMetrics`, `useDraggableDrawer`; all consume `api` and `types`.
- `src/store/`: Redux (quotes slice, selectors, `QuoteSocketSubscriber`), custom portfolio UI store (`usePortfolioStore`).
- `src/components/`: UI by feature (`account/`, `portfolio/`, `ui/`, `charts/`, `native/`, `watchlist/`). Watchlist: `WatchlistCard`, `WatchlistItemRow`, `StockDetailDrawer` (draggable, watchlist options), `AddSymbolModal` (draggable drawer).

### Diagrams

- **C4 component diagram** (en): `docs/en/c4/c4-mobile-portfolio-components.puml`
- **C4 component diagram** (zh): `docs/zh/c4/c4-mobile-portfolio-components.puml`

## Getting Started

```bash
pnpm install
pnpm start
```

For native charts, use development builds:

```bash
pnpm run ios
pnpm run android
```

Expo Go has limited support for native modules.

### Android: No device or emulator

From the **repo root**: `pnpm dev:mobile-portfolio:android`. From the app directory: `pnpm run android`. Ensure a device or emulator is running and `ANDROID_HOME` is set (e.g. `~/Library/Android/sdk`).

If you see **"No Android connected device found, and no emulators could be started automatically"**:

1. **Option A – Android emulator (recommended)**  
   - Install [Android Studio](https://developer.android.com/studio) and the Android SDK.  
   - Open **Device Manager** (Tools → Device Manager) and **Create Device**. Pick a phone (e.g. Pixel 6), then download a system image (e.g. API 34) and finish.  
   - Start the emulator from Device Manager (play button), or from CLI:  
     `$ANDROID_HOME/emulator/emulator -avd <AVD_NAME>`  
     (List AVDs: `$ANDROID_HOME/emulator/emulator -list-avds`.)  
   - Then run `pnpm run android` again.

2. **Option B – Physical device**  
   - Enable **Developer options** and **USB debugging** on the device ([guide](https://developer.android.com/studio/run/device)).  
   - Connect via USB and accept the debugging prompt.  
   - Run `adb devices` to confirm the device is listed, then `pnpm run android`.

If you see **"Unable to locate a Java Runtime"**: set `JAVA_HOME` to a JDK 17+ (e.g. Homebrew: `export JAVA_HOME="/opt/homebrew/opt/openjdk@17"`).

## Backend

The app connects only to the backend; there is no in-app mock data.

| Endpoint | Usage |
|----------|--------|
| `GET /api/v1/portfolio` | Aggregated portfolio (Dashboard, Accounts, Insights) |
| `GET /api/v1/quotes?symbols=...` | One-off quote fetch via `getQuotes(symbols)` |
| `WS /ws/quotes` | Real-time quotes via `createQuoteSocket` (Stocks, Watchlists) |
| `POST /api/v1/seed` | Seed portfolio via `portfolioApi.seedPortfolio(payload)` |
| `GET /api/v1/customers` | Resolve current customer for Profile and Watchlists |
| `GET/PUT /api/v1/user-preferences` | Profile preferences (theme, language, notifications) |
| `GET/POST/DELETE /api/v1/watchlists`, `watchlist-items` | Watchlists screen |
| `GET /api/v1/instruments` | Symbol/name lookup for watchlist items |
| `GET /api/v1/risk-metrics` | Insights server metrics (volatility, Sharpe, VaR, beta) when available |

1. From repo root: `pnpm run start:backend` (Docker + TimescaleDB + Redis + Kafka + API + seed + mock quote producer).
2. Or separately: `pnpm run start:kafka` for Kafka and mock quotes only.
3. Override the base URL with `EXPO_PUBLIC_PORTFOLIO_API_URL` in `.env` if needed (e.g. `http://192.168.x.x:8800` when using a simulator or device).
4. Pull-to-refresh on the dashboard calls `usePortfolio().refresh()` and refetches from the backend.

### Real-time quotes and sparklines

Stocks and Watchlists use a single Redux-backed flow:

- **QuoteSocketSubscriber** (in root layout) reads `subscribedSymbols` from the store, opens one WebSocket to `/ws/quotes`, and dispatches `setSnapshot` / `setStatus`. Screens call **useSymbolDisplayData(symbols)** to set subscribed symbols and read `bySymbol`, `quoteMap`, `historyBySymbol` from the store (with memoized selectors).
- **StockDetailDrawer** and **AddSymbolModal** use **useDraggableDrawer** for slide-up/drag-to-close animation; close button and backdrop use the same close animation.
- **StockListItem** and **WatchlistItemRow** show NativeSparkline (history from `useSymbolDisplayData`), current price, and daily change. Tapping a row opens **StockDetailDrawer** with live price and chart; on Watchlists, the drawer shows watchlist options (remove from list, add to another list).
