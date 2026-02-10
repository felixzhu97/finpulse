# Mobile Portfolio

Portfolio management mobile app for viewing investment accounts, performance charts, and insights. Part of the fintech-project monorepo.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Expo 54, React 19, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| State | Zustand |
| Charts | react-native-wagmi-charts, react-native-chart-kit, react-native-svg |
| Native Charts | iOS Metal (Swift), Android (Kotlin) |
| Navigation | React Navigation (bottom-tabs) |

Native chart components: line, candlestick (K-line), American OHLC, baseline, histogram, line-only, with horizontal scroll and tooltips.

## Main Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/(tabs)/` | Portfolio summary, net worth chart, asset allocation, native chart demos |
| Stocks | `/(tabs)/accounts` | Stock list with real-time prices, per-stock sparklines, account summaries |
| Insights | `/(tabs)/insights` | Portfolio insights and analytics |
| Profile | `/(tabs)/profile` | User profile |

## Project Structure

- `app/`: expo-router routes and screens.
- `src/components/`: presentational components only, grouped by domain:
  - `account/`: StockListItem, AccountListItem.
  - `portfolio/`: portfolio summary and charts.
  - `ui/`: generic UI such as metric cards.
  - `charts/`: advanced chart examples.
  - `native/`: native chart wrappers and scroll/tooltip helpers.
- `src/services/`: data fetching and caching (e.g. `portfolioService`, `quoteSocket`).
- `src/hooks/`: reusable hooks (e.g. `useRealtimeQuotes`, `usePerSymbolHistory`).
- `src/store/`: global state with Zustand.
- `src/types/`: shared TypeScript types used across the app.

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

1. From repo root: `pnpm run start:backend` (Docker + TimescaleDB + Redis + Kafka + API + seed + mock quote producer).
2. Or separately: `pnpm run start:kafka` for Kafka and mock quotes only.
3. The app expects `GET /api/v1/portfolio` for initial state and WebSocket `/ws/quotes` for real-time prices. Override the base URL with `EXPO_PUBLIC_PORTFOLIO_API_URL` in `.env` if needed (e.g. `http://192.168.x.x:8800` when using a simulator or device).
4. Pull-to-refresh on the dashboard clears the cache and refetches from the backend.

### Real-time quotes and sparklines

The Stocks screen displays holdings and account summaries with live data:

- `useRealtimeQuotes` opens a WebSocket connection to `/ws/quotes`, subscribes to symbols, and listens for `snapshot` messages.
- `usePerSymbolHistory` accumulates per-symbol price history from quote snapshots for sparkline display.
- `StockListItem` shows each stock with NativeSparkline (per-stock history from real-time data), current price, and daily change.
