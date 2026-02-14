# Mobile Portfolio

Portfolio management mobile app for viewing investment accounts, performance charts, and insights. Part of the fintech-project monorepo.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Expo 54, React 19, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| State | Redux Toolkit (quotes, preferences, portfolio) |
| Charts | react-native-wagmi-charts, react-native-chart-kit, react-native-svg |
| Native Charts | iOS Metal (Swift), Android (Kotlin) |
| Navigation | React Navigation (bottom-tabs) |
| UI | styled-components (theme-aware), expo-blur (Liquid Glass), useDraggableDrawer (bottom sheets) |
| Internationalization | i18next, react-i18next (English, Chinese) |

Native chart components: line, candlestick (K-line), American OHLC, baseline, histogram, line-only, with horizontal scroll and tooltips. Native code follows OOP principles with abstract base classes (`BaseChartViewManager`, `BaseChartView`, `BaseChartRenderer`) and helper classes for layout calculation, value formatting, axis label management, and rendering logic.

## Main Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/(tabs)/` | Portfolio summary, net worth chart, asset allocation, native line chart |
| Watchlist | `/(tabs)/watchlists` | Stock list (portfolio holdings) with real-time prices, sparklines, account rows; search (bottom sheet, closes on drawer/sort/tab), sort menu; pull-to-refresh; stock detail drawer (draggable, share) |
| Insights | `/(tabs)/insights` | Risk metrics from API (volatility, Sharpe ratio, VaR, beta) via `GET /api/v1/risk-metrics`; computed VaR via `POST /api/v1/risk-metrics/compute` (useComputedVar hook) |
| Account | `/(tabs)/account` | Profile, account list, Actions (Register Customer, New Payment, New Trade, Settings), drawers. **useAccountData** loads customer, accounts, accountResources on tab focus via useFocusEffect. In development, Actions include a **Storybook** entry that navigates to `/storybook`. |

## Project Structure (Clean Architecture)

The app follows **Clean Architecture** with a flat `src/` layout. Logical layers are preserved; code lives under `src/types/`, `src/lib/*`, `src/hooks/`, `src/components/`, `src/styles/`, `src/store/`.

### Architecture Layers

- **Domain** (`src/types/`): Entities and repository interfaces
  - Entity types: `portfolio.ts`, `quotes.ts`, `customer.ts`, `userPreference.ts`, `watchlist.ts`, `instrument.ts`, `riskMetrics.ts`, `payment.ts`, `trade.ts`, `order.ts`, `blockchain.ts`, `accountResource.ts`, `varCompute.ts`
  - Repository interfaces: `IPortfolioRepository`, `IQuoteRepository`, `ICustomerRepository`, `IUserPreferenceRepository`, `IWatchlistRepository`, `IInstrumentRepository`, `IRiskMetricsRepository`, `IPaymentRepository`, `ITradeRepository`, `IOrderRepository`, `IBlockchainRepository`, `IAccountRepository`

- **Application** (`src/lib/services/`): Use cases and DI
  - Use cases: `GetPortfolioUseCase`, `GetQuotesUseCase`, `GetAccountDataUseCase`, `PaymentUseCase`, `TradeUseCase`, `WatchlistUseCase`, `UserPreferenceUseCase`, `RiskMetricsUseCase`, `BlockchainUseCase`, `RegisterCustomerUseCase`
  - `DependencyContainer`: provides repository instances and use cases
  - `QuoteStreamService`, `IQuoteStreamService`, `web3Service`

- **Infrastructure** (`src/lib/api/`, `src/lib/network/`, `src/lib/utils/`): HTTP, WebSocket, and repository implementations
  - `lib/network/`: `httpClient.ts`, `quoteSocket.ts`, `config.ts`
  - `lib/api/`: Repository implementations (`PortfolioRepository`, `QuoteRepository`, `CustomerRepository`, etc.)
  - `lib/utils/`: `format.ts`, `stockDisplay.ts`, `PeriodDataProcessor.ts`

- **Presentation**: UI, hooks, state, styles, i18n
  - `src/components/`: Feature-based components (`account/`, `portfolio/`, `ui/`, `charts/`, `native/`, `watchlist/`, `insights/`, `blockchain/`)
  - `src/hooks/`: `usePortfolio`, `useAccountData`, `useSymbolDisplayData`, `usePreferences`, `useWatchlists`, `useRiskMetrics`, `useComputedVar`, `useDraggableDrawer`, `useAsyncLoad`, etc.
  - `src/store/`: Redux (quotes, preferences, portfolio slices, selectors, `QuoteSocketSubscriber`)
  - `src/styles/`: `colors.ts`, `useTheme.ts`, `StyledThemeProvider`, `primitives.ts`, `themeTypes.ts`
  - `src/lib/i18n/`: `config.ts`, locales (en, zh), `useTranslation`

- `app/`: Expo Router file-based routes and screens

### Dependency Flow

```
Presentation → Application → Domain
     ↓              ↑
Infrastructure ────┘
```

- Presentation layer depends on Application and Domain layers
- Application layer depends only on Domain layer
- Infrastructure layer implements Domain interfaces and is used by Application layer
- No circular dependencies; clear separation of concerns
- **Native**: `ios/mobileportfolio/` (iOS OOP: BaseChartViewManager, BaseChartView, BaseChartRenderer; ChartSupport, ChartLayoutCalculator, ValueFormatter, AxisLabelManager). `android/.../view/` (Android: ChartGl, ChartCurve, ChartLayoutCalculator, ValueFormatter, AxisLabelManager, HistogramRenderer, sparkline, democard).

### Diagrams

- **C4 component diagram** (en): `docs/en/c4/c4-mobile-portfolio-components.puml`
- **C4 component diagram** (zh): `docs/zh/c4/c4-mobile-portfolio-components.puml`

## Storybook (native component catalog)

This app uses **Storybook for React Native** to document native and React Native components (including Metal/Kotlin chart bridges in `src/components/native`).

- **Stories**: `src/components/**/*.stories.tsx` (e.g. `NativeLineChart`, `NativeCandleChart`, `NativeBaselineChart`, `NativeHistogramChart`, `NativeLineOnlyChart`, `NativeSparkline`, `NativeDemoCard`).
- **Route**: `/storybook` in `app/storybook.tsx`, wrapping `StorybookUIRoot` with a back bar.
- **Entry** (dev): Account tab → Actions → Storybook row when `__DEV__`.

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

## Backend

The app is a thin client: all portfolio and risk business logic runs on the Portfolio Analytics API; the mobile app focuses on presentation, navigation, and light orchestration.

| Endpoint | Usage |
|----------|--------|
| `GET /api/v1/portfolio` | Aggregated portfolio (Overview, Accounts, Analytics) used by `PortfolioRepository.getPortfolio()` |
| `GET /api/v1/portfolio/risk-summary` | Portfolio risk summary (high risk ratio, top holdings concentration) used by `PortfolioRepository.getRiskSummary()` and `useRiskSummary` |
| `GET /api/v1/portfolio/asset-allocation-by-account-type` | Asset allocation grouped by account type used by `PortfolioRepository.getAssetAllocationByAccountType()` and `GetPortfolioUseCase` |
| `GET /api/v1/quotes?symbols=...` | One-off quote fetch via `getQuotes(symbols)` |
| `WS /ws/quotes` | Real-time quotes via `createQuoteSocket` (Watchlist screen) |
| `POST /api/v1/seed` | Seed portfolio via `PortfolioRepository.seedPortfolio(payload)` |
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

1. From repo root: `pnpm run start:backend` (Docker + TimescaleDB + Redis + Kafka + API + seed + mock quote producer).
2. Or separately: `pnpm run start:kafka` for Kafka and mock quotes only.
3. Override the base URL with `EXPO_PUBLIC_PORTFOLIO_API_URL` in `.env` if needed (e.g. `http://192.168.x.x:8800` when using a simulator or device).

### Real-time quotes and sparklines

Single Redux-backed flow, one WebSocket:

- **QuoteSocketSubscriber** reads merged symbols (`subscribedSymbols` + `extraSubscribedSymbols`) from the store, subscribes to `/ws/quotes`, dispatches `setSnapshot` / `setStatus`.
- **useSymbolDisplayData(symbols)** sets `subscribedSymbols` and reads `bySymbol`, `quoteMap`, `historyBySymbol` (memoized selectors).
- **StockDetailDrawer** dispatches `setExtraSubscribedSymbols([symbol])` when open, reads quotes from Redux.
- **StockListItem** shows sparkline (history from `useSymbolDisplayData`), current price, and daily change. Tapping a row opens **StockDetailDrawer** with live price and chart. **SortMenu** (name, price, change, change %) and a **bottom search bar** (opened by header search icon, **GlassView**; closes when opening detail drawer, sort menu, or switching tab) are on the Watchlist screen. Tab bar uses **expo-blur** (Liquid Glass) background.

## Theming

The app supports light and dark themes with automatic system theme detection and **styled-components** for theme-aware UI:

- **Theme System**: `src/styles/colors.ts` defines light/dark schemes; `src/styles/useTheme.ts` provides `useTheme()`; `themeTypes.ts` defines `AppTheme` and augments styled-components `DefaultTheme`.
- **Styled Components**: Root layout uses `StyledThemeProvider` (injects `colors` from `useTheme()`). Primitives in `src/styles/primitives.ts`: `ScreenRoot`, `ListRow`, `CardBordered`, `SafeAreaScreen`, `LabelText`, `ValueText`, `RowTitle`, `withTheme()`. Screens and lists use these for theme-driven styling.
- **User Preferences**: Managed via Redux (`preferencesSlice`) for immediate theme updates. Initial loading is component-level: `AppContent` shows a spinner until `usePreferences().loading` is false. Settings drawer allows users to choose light, dark, or auto (follow system) theme.
- **Theme Persistence**: User theme preference is saved via `/api/v1/user-preferences` and restored on app launch.

## Internationalization

The app supports multiple languages with dynamic language switching:

- **i18n System**: `src/lib/i18n/config.ts` configures i18next; translations in `src/lib/i18n/locales/` (en, zh).
- **Language Management**: Language preference is stored in Redux (`preferencesSlice`) and synchronized with i18next. When users change language in Settings, all UI text updates immediately.
- **Components**: All screens and components use `useTranslation()` hook from `react-i18next` to access translated strings. Translation keys are organized by feature (common, tabs, dashboard, watchlist, insights, account).
- **Language Persistence**: User language preference is saved via `/api/v1/user-preferences` and restored on app launch. The app initializes with the saved language or defaults to English.
- **Supported Languages**: English (`en`) and Chinese Simplified (`zh`).
