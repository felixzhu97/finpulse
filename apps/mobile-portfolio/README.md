# Mobile Portfolio

Portfolio management mobile app for viewing investment accounts, performance charts, and insights. Part of the fintech-project monorepo.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Expo 55 (preview), React 19.2, React Native 0.83 |
| Routing | expo-router 55 (file-based) |
| State | Redux Toolkit (quotes with historyLoaded, preferences, portfolio, web3); serializableCheck.ignoredPaths for quotes/history |
| Charts | react-native-wagmi-charts, react-native-chart-kit, react-native-svg |
| Native Charts | iOS Metal (Swift), Android (Kotlin) |
| Navigation | React Navigation (bottom-tabs) |
| UI | styled-components (theme-aware), expo-blur (Liquid Glass), useDraggableDrawer (bottom sheets) |
| Internationalization | i18next, react-i18next (English, Chinese) |

Native chart components: line (gradient fill in light and dark theme), candlestick (K-line), American OHLC, baseline, histogram, line-only, with horizontal scroll and tooltips. **NativeSparkline** shows only baseline when history data length &lt; 2. Native code follows OOP principles with abstract base classes (`BaseChartViewManager`, `BaseChartView`, `BaseChartRenderer`) and helper classes for layout calculation, value formatting, axis label management, and rendering logic.

## Main Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/(tabs)/` | Portfolio summary, net worth chart, asset allocation, native line chart |
| Watchlist | `/(tabs)/watchlists` | Stock list (portfolio holdings) with real-time prices, sparklines, account rows; search (bottom sheet, closes on drawer/sort/tab), sort menu; pull-to-refresh; stock detail drawer (draggable, share) |
| Insights | `/(tabs)/insights` | Risk metrics from API (volatility, Sharpe ratio, VaR, beta) via `GET /api/v1/risk-metrics`; computed VaR via `POST /api/v1/risk-metrics/compute` (useComputedVar hook) |
| Account | `/(tabs)/account` | Profile, account list, **Wallet** (Connect/Disconnect via WalletConnectButton; Redux web3). Actions: Register Customer, New Payment, New Trade, **Quick trade**, **Send ETH** (EthTransferDrawer, real Ethereum; default Sepolia testnet), Settings. **useAccountData** loads on tab focus; in dev, Actions include **Storybook**. |

## Project Structure (Clean Architecture)

The app follows **Clean Architecture** principles with clear separation of concerns across four layers:

### Architecture Layers

- **Domain Layer** (`src/domain/`): Data shapes only
  - `entities/`: Domain models (`portfolio.ts`, `quotes.ts`, `customer.ts`, `userPreference.ts`, `watchlist.ts`, `instrument.ts`, `riskMetrics.ts`, `payment.ts`, `trade.ts`, `order.ts`, `blockchain.ts`, `accountResource.ts`, `varCompute.ts`)
  - `dto.ts`: Shared DTOs (`WatchlistWithItems`, `UpdatePreferenceInput`, `AccountDataResult`, `RegisterCustomerInput`)

- **Infrastructure Layer** (`src/infrastructure/`): API and external integrations
  - `api/`: REST API by domain (`portfolio`, `market`, `account`, `risk`); `getPortfolioData`, `getQuotes`, `getQuotesHistoryBatch`, `getWatchlists`, `getAccountData`, `getRiskMetrics`, etc.; all use `httpClient`
  - `network/`: HTTP client, WebSocket factory, config (`httpClient.ts`, `quoteSocket.ts`, `config.ts`)
  - `config/`: Web3 config (`web3Config.ts`: `getWeb3Config`, `SEPOLIA_CHAIN_ID`; env: `EXPO_PUBLIC_ETH_RPC_URL`, `EXPO_PUBLIC_ETH_CHAIN_ID`, `EXPO_PUBLIC_ETH_CHAIN_NAME`)
  - `services/`: Quote stream and Web3 (`quoteStreamTypes.ts`, `QuoteStreamService`, `quoteStreamService`, `web3Service`)

- **Presentation Layer** (`src/presentation/`): UI components, hooks, and state management
  - `components/`: React Native components by feature (`account/`, `portfolio/`, `ui/`, `charts/`, `native/`, `watchlist/`, `insights/`, `blockchain/`)
  - `hooks/`: React hooks by domain (`portfolio`, `market`, `account`, `risk`, `blockchain`, `common`); call `infrastructure/api` and `infrastructure/services` (`usePortfolio`, `useAccountData`, `useSymbolDisplayData`, `useWeb3`, `usePreferences`, `useWatchlists`, `useRiskMetrics`, `useComputedVar`, `useDraggableDrawer`, etc.); shared utilities (`useAsyncLoad`, `runWithLoading`)
  - `utils/`: Presentation utilities (`format.ts`, `stockDisplay.ts`, `PeriodDataProcessor.ts`)
  - `store/`: Redux (quotes slice, preferences slice, portfolio slice, **web3 slice** (connectWallet, disconnectWallet, refreshWalletBalance), selectors, `QuoteSocketSubscriber` using `quoteStreamService`)
  - `theme/`: Theme system (`colors.ts`, `useTheme.ts`, `StyledThemeProvider`, `primitives.ts`, `themeTypes.ts`)
  - `i18n/`: Internationalization (`config.ts`, locales, `useTranslation`)

- `app/`: Expo Router file-based routing and screens

### Dependency Flow

```
Presentation (hooks, screens) → Infrastructure (api, services)
         ↓                              ↓
      Domain (entities, dto)      network (httpClient, quoteSocket)
```

- Presentation depends on Domain (types) and Infrastructure (api + services)
- Infrastructure API uses `httpClient`; services use `quoteSocket` or Web3
- No application layer or container; hooks import from `infrastructure/api` and `infrastructure/services` directly
- `ios/mobileportfolio/`: Native iOS code with OOP structure. Chart components inherit from base classes: `BaseChartViewManager` (abstract RCTViewManager), `BaseChartView` (abstract UIView with Metal setup), `BaseChartRenderer` (abstract Metal renderer). Chart components use helper classes: `ChartLayoutCalculator` (layout calculations), `ValueFormatter` (value formatting), `AxisLabelManager` (axis label management), `ChartDataCalculator` (data calculations). ChartSupport provides shared utilities: ChartCurve, ChartVertex, ChartPipeline, ChartGrid, ChartThemes.
- `android/app/src/main/java/com/anonymous/mobileportfolio/view/`: Native Android code with OOP structure. Chart components use helper classes: `ChartLayoutCalculator`, `ValueFormatter`, `AxisLabelManager`, `HistogramRenderer`. Chart package (`view/chart/`) provides ChartGl, ChartCurve, and per-chart themes. Sparkline and democard packages provide specialized components.

### Diagrams

- **C4 component diagram** (en): `docs/en/rd/c4/c4-mobile-portfolio-components.puml`
- **C4 component diagram** (zh): `docs/zh/rd/c4/c4-mobile-portfolio-components.puml`

## Storybook (native component catalog)

This app uses **Storybook for React Native** to document and exercise native and React Native components (especially the Metal/Kotlin chart bridges in `src/presentation/components/native`).

- **Stories**: Live under `src/presentation/components/**\/*.stories.tsx`, including the native chart components (`NativeLineChart`, `NativeCandleChart`, `NativeBaselineChart`, `NativeHistogramChart`, `NativeLineOnlyChart`, `NativeSparkline`, `NativeDemoCard`).
- **Route**: `/storybook` implemented by `app/storybook.tsx`, which wraps `StorybookUIRoot` (from `.rnstorybook`) and adds a simple back bar.
- **Entry point in UI** (dev only): On the **Account** tab, the **Actions** card shows a `Storybook` row when `__DEV__` is true; tapping it navigates to `/storybook`.

Because the app relies on native chart views, Storybook must run inside the **dev build client**, not inside Expo Go.

## Getting Started

```bash
pnpm install
pnpm start
pnpm --filter mobile-portfolio storybook
```

For native charts and Storybook, use development builds:

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

### iOS: pod install / SDWebImage clone timeout

If `pod install` fails with **"RPC failed; curl 56 Recv failure: Operation timed out"** when cloning SDWebImage (or other git-based pods):

1. Increase Git HTTP buffer and retry from the app directory:
   ```bash
   git config --global http.postBuffer 524288000
   cd ios && pod install
   ```
   Or run: `pnpm run pod-install` (from `apps/mobile-portfolio`).

2. If it still times out, try a different network, disable VPN, or retry later; the clone is from GitHub and can be sensitive to latency.

## Backend

The app is a thin client: all portfolio and risk business logic runs on the Portfolio Analytics API; the mobile app focuses on presentation, navigation, and light orchestration.

| Endpoint | Usage |
|----------|--------|
| `GET /api/v1/portfolio` | Aggregated portfolio (Overview, Accounts, Analytics) via `getPortfolioData()` in api |
| `GET /api/v1/portfolio/risk-summary` | Portfolio risk summary (high risk ratio, top holdings concentration) via `getRiskSummary()` and `useRiskSummary` |
| `GET /api/v1/portfolio/asset-allocation-by-account-type` | Asset allocation grouped by account type via `getPortfolioData()` |
| `GET /api/v1/quotes?symbols=...` | One-off quote fetch via `getQuotes(symbols)` |
| `GET /api/v1/quotes/history?symbols=...&minutes=...` | Batch quote history via `getQuotesHistoryBatch(symbols, days)` (single request for all symbols) |
| `WS /ws/quotes` | Real-time quotes via `createQuoteSocket` and `quoteStreamService` (Watchlist screen) |
| `POST /api/v1/seed` | Seed portfolio via `seedPortfolio(payload)` in api |
| `GET /api/v1/customers` | Customer info for Account Profile |
| `POST /api/v1/customers` | Register customer (returns `ai_identity_score`) |
| `GET /api/v1/accounts` | Account list for payment/trade flows |
| `POST /api/v1/payments` | Create payment (returns `fraud_recommendation`, `fraud_score`) |
| `POST /api/v1/orders` | Create order |
| `POST /api/v1/trades` | Create trade (returns `surveillance_alert`, `surveillance_score`) |
| `GET/PUT /api/v1/user-preferences` | Account Settings (theme, language, notifications) |
| `GET /api/v1/instruments` | Symbol/name lookup for trade flow |
| `GET /api/v1/risk-metrics` | Analytics risk metrics (volatility, Sharpe, VaR, beta) |
| `POST /api/v1/risk-metrics/compute` | Compute VaR from portfolio history |

1. From repo root: `pnpm run start:server` (Docker + TimescaleDB + Redis + Kafka + API + seed + mock quote producer).
2. Or separately: `pnpm run start:kafka` for Kafka and mock quotes only.
3. Override the base URL with `EXPO_PUBLIC_PORTFOLIO_API_URL` in `.env` if needed (e.g. `http://192.168.x.x:8801` when using a simulator or device).

### Real-time quotes and sparklines

Single Redux-backed flow, one WebSocket; **history before real-time**:

- **useQuotesForSymbols(symbols)** fetches history via `getQuotesHistoryBatch(symbols, 5)` and snapshot via `getQuotes(symbols)`; each response dispatches **as soon as it arrives** (`setHistory` / `setSnapshot`), so history can appear before snapshot.
- **QuoteSocketSubscriber** subscribes to `/ws/quotes` **only after** `historyLoaded` is true (set by first `setHistory`). It reads merged symbols (`subscribedSymbols` + `extraSubscribedSymbols`), connects, then **1s refresh**; dispatches `setSnapshot` / `setStatus`.
- **useSymbolDisplayData(symbols, initialPrices, subscribeSymbols)** sets `subscribedSymbols` to `subscribeSymbols` when provided (else `symbols`). Watchlist passes **visible-only** symbols (from `onViewableItemsChanged`) so only viewport + detail symbol are subscribed.
- **StockDetailDrawer** dispatches `setExtraSubscribedSymbols([symbol])` when open; detail price updates in real time.
- **WatchlistRow** (memo) wraps **WatchlistItemRow** with stable `onPress` for VirtualizedList performance. **NativeSparkline** shows only baseline when data length &lt; 2 (no fake trend). **SortMenu** and **bottom search bar** (GlassView) on Watchlist; tab bar uses **expo-blur** (Liquid Glass).

## Theming

The app supports light and dark themes with automatic system theme detection and **styled-components** for theme-aware UI:

- **Theme System**: `src/presentation/theme/colors.ts` defines light/dark color schemes. `useTheme.ts` provides the `useTheme()` hook (no circular dependency with `StyledThemeProvider`). `theme/index.ts` re-exports theme APIs; `themeTypes.ts` defines `AppTheme` and augments styled-components `DefaultTheme`.
- **Styled Components**: Root layout wraps the app with `StyledThemeProvider`, which reads `useTheme()` and injects `{ colors }` into styled-components. Primitives (`primitives.ts`) include layout primitives (`ScreenRoot`, `ListRow`, `CardBordered`, `SafeAreaScreen`, etc.), text primitives (`LabelText`, `ValueText`, `RowTitle`, etc.), and `withTheme()` for type-safe theme access. Main screens (Dashboard, Account, Watchlist, Insights) and list components use these styled components for consistent, theme-driven styling.
- **User Preferences**: Managed via Redux (`preferencesSlice`) for immediate theme updates. Initial loading is component-level: `AppContent` shows a spinner until `usePreferences().loading` is false. Settings drawer allows users to choose light, dark, or auto (follow system) theme.
- **Theme Persistence**: User theme preference is saved via `/api/v1/user-preferences` and restored on app launch.

## Internationalization

The app supports multiple languages with dynamic language switching:

- **i18n System**: `src/i18n/config.ts` configures i18next with React Native support. Translation resources are stored in `src/i18n/locales/` (currently English and Chinese).
- **Language Management**: Language preference is stored in Redux (`preferencesSlice`) and synchronized with i18next. When users change language in Settings, all UI text updates immediately.
- **Components**: All screens and components use `useTranslation()` hook from `react-i18next` to access translated strings. Translation keys are organized by feature (common, tabs, dashboard, watchlist, insights, account).
- **Language Persistence**: User language preference is saved via `/api/v1/user-preferences` and restored on app launch. The app initializes with the saved language or defaults to English.
- **Supported Languages**: English (`en`) and Chinese Simplified (`zh`).
