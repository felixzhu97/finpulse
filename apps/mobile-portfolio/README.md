# Mobile Portfolio

Portfolio management mobile app for viewing investment accounts, performance charts, and insights. Part of the fintech-project monorepo.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Expo 54, React 19, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| State | Redux Toolkit (quotes, preferences), custom store (portfolio UI) |
| Charts | react-native-wagmi-charts, react-native-chart-kit, react-native-svg |
| Native Charts | iOS Metal (Swift), Android (Kotlin) |
| Navigation | React Navigation (bottom-tabs) |
| UI | expo-blur (Liquid Glass), useDraggableDrawer (bottom sheets) |
| Internationalization | i18next, react-i18next (English, Chinese) |

Native chart components: line, candlestick (K-line), American OHLC, baseline, histogram, line-only, with horizontal scroll and tooltips.

## Main Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/(tabs)/` | Portfolio summary, net worth chart, asset allocation, native line chart |
| Watchlist | `/(tabs)/watchlists` | Stock list (portfolio holdings) with real-time prices, sparklines, account rows; search (bottom sheet, closes on drawer/sort/tab), sort menu; pull-to-refresh; stock detail drawer (draggable, share) |
| Insights | `/(tabs)/insights` | Risk metrics from API (volatility, Sharpe ratio, VaR, beta, risk level) via `/api/v1/risk-metrics` |
| Account | `/(tabs)/account` | Profile section (customer info from `/api/v1/customers`), account list (from `/api/v1/portfolio`), and Settings drawer (user preferences: theme, language, notifications via `/api/v1/user-preferences`) |

## Project Structure (Thin Client)

The app is a **thin client**: business logic lives on the server; the mobile app fetches data and renders UI.

Account and Insights also use `usePreferences` (Redux-backed), `useRiskMetrics` and `customersApi`, `userPreferencesApi`, `riskMetricsApi` (REST: customers, user-preferences, risk-metrics). Theme changes apply immediately via Redux state management.

- `app/`: expo-router routes and screens.
- `src/api/`: data layer—implements backend contracts (single-layer; no subfolders).
  - `config.ts`: base URL (`EXPO_PUBLIC_PORTFOLIO_API_URL`).
  - `portfolioApi.ts`: GET portfolio (cached), getAccounts, getAccountById, getHoldingsByAccount, getAssetAllocationByAccountType, getPortfolioHistory, getRiskSummary, invalidateCache, seedPortfolio(POST /api/v1/seed).
  - `quotes.ts`: `getQuotes(symbols)` (GET /api/v1/quotes).
  - `quoteSocket.ts`: `createQuoteSocket()` for WebSocket `/ws/quotes`.
  - `customersApi.ts`, `userPreferencesApi.ts`, `riskMetricsApi.ts`: REST resources for Profile, Insights. `watchlistsApi.ts`, `instrumentsApi.ts` available for future use.
- `src/types/`: shared interfaces—`portfolio.ts`, `quotes.ts`, `customer.ts`, `userPreference.ts`, `watchlist.ts`, `instrument.ts`, `riskMetrics.ts`; `index.ts` re-exports all.
- `src/theme/`: theme system—`colors.ts` (light/dark color schemes), `index.ts` (`useTheme` hook for dynamic theming).
- `src/i18n/`: internationalization—`config.ts` (i18next setup), `locales/en.json` and `locales/zh.json` (translation resources), `index.ts` (exports `i18n` and `useTranslation` hook).
- `src/hooks/`: `usePortfolio`, `useSymbolDisplayData` (Redux-backed quotes + history for list/drawer), `useRealtimeQuotes`, `usePerSymbolHistory`, `usePreferences` (Redux-backed user preferences), `useWatchlists`, `useRiskMetrics`, `useDraggableDrawer`; all consume `api` and `types`.
- `src/store/`: Redux (quotes slice, preferences slice for theme/language/notifications, selectors, `QuoteSocketSubscriber`), custom portfolio UI store (`usePortfolioStore`).
- `src/components/`: UI by feature (`account/`, `portfolio/`, `ui/`, `charts/`, `native/`, `watchlist/`). Watchlist screen uses `AccountListItem`, `StockListItem`, `StockDetailDrawer` (draggable), `SortMenu`, bottom search bar (`GlassView`), `useFocusEffect` (close search on tab switch). All components support light/dark theme via `useTheme` hook and internationalization via `useTranslation` hook.

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
| `GET /api/v1/portfolio` | Aggregated portfolio (Overview, Accounts, Analytics) |
| `GET /api/v1/quotes?symbols=...` | One-off quote fetch via `getQuotes(symbols)` |
| `WS /ws/quotes` | Real-time quotes via `createQuoteSocket` (Watchlist screen) |
| `POST /api/v1/seed` | Seed portfolio via `portfolioApi.seedPortfolio(payload)` |
| `GET /api/v1/customers` | Customer info for Account Profile section |
| `GET/PUT /api/v1/user-preferences` | Account Settings preferences (theme, language, notifications) |
| `GET /api/v1/instruments` | Symbol/name lookup (if used) |
| `GET /api/v1/risk-metrics` | Analytics risk metrics (volatility, Sharpe, VaR, beta, risk level) |

1. From repo root: `pnpm run start:backend` (Docker + TimescaleDB + Redis + Kafka + API + seed + mock quote producer).
2. Or separately: `pnpm run start:kafka` for Kafka and mock quotes only.
3. Override the base URL with `EXPO_PUBLIC_PORTFOLIO_API_URL` in `.env` if needed (e.g. `http://192.168.x.x:8800` when using a simulator or device).
4. Pull-to-refresh on the dashboard calls `usePortfolio().refresh()` and refetches from the backend.

### Real-time quotes and sparklines

The Watchlist screen uses a single Redux-backed flow:

- **QuoteSocketSubscriber** (in root layout) reads `subscribedSymbols` from the store, opens one WebSocket to `/ws/quotes`, and dispatches `setSnapshot` / `setStatus`. The Stocks screen calls **useSymbolDisplayData(symbols)** to set subscribed symbols and read `bySymbol`, `quoteMap`, `historyBySymbol` from the store (with memoized selectors).
- **StockDetailDrawer** uses **useDraggableDrawer** for slide-up/drag-to-close animation; close button and backdrop use the same close animation; share action is available in the drawer header.
- **StockListItem** shows sparkline (history from `useSymbolDisplayData`), current price, and daily change. Tapping a row opens **StockDetailDrawer** with live price and chart. **SortMenu** (name, price, change, change %) and a **bottom search bar** (opened by header search icon, **GlassView**; closes when opening detail drawer, sort menu, or switching tab) are on the Watchlist screen. Tab bar uses **expo-blur** (Liquid Glass) background.

## Theming

The app supports light and dark themes with automatic system theme detection:

- **Theme System**: `src/theme/colors.ts` defines color schemes for light and dark modes. `src/theme/index.ts` provides `useTheme()` hook that returns current theme colors based on user preference and system settings.
- **User Preferences**: Managed via Redux (`preferencesSlice`) for immediate theme updates. Settings drawer allows users to choose light, dark, or auto (follow system) theme.
- **Components**: All UI components use `useTheme()` hook to dynamically adapt colors. Cards have rounded corners (`borderRadius: 16`) and support theme-aware backgrounds.
- **Theme Persistence**: User theme preference is saved via `/api/v1/user-preferences` and restored on app launch.

## Internationalization

The app supports multiple languages with dynamic language switching:

- **i18n System**: `src/i18n/config.ts` configures i18next with React Native support. Translation resources are stored in `src/i18n/locales/` (currently English and Chinese).
- **Language Management**: Language preference is stored in Redux (`preferencesSlice`) and synchronized with i18next. When users change language in Settings, all UI text updates immediately.
- **Components**: All screens and components use `useTranslation()` hook from `react-i18next` to access translated strings. Translation keys are organized by feature (common, tabs, dashboard, watchlist, insights, account).
- **Language Persistence**: User language preference is saved via `/api/v1/user-preferences` and restored on app launch. The app initializes with the saved language or defaults to English.
- **Supported Languages**: English (`en`) and Chinese Simplified (`zh`).
