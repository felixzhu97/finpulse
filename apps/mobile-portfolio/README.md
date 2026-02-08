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
| Accounts | `/(tabs)/accounts` | Account list and balances |
| Insights | `/(tabs)/insights` | Portfolio insights and analytics |
| Profile | `/(tabs)/profile` | User profile |
| Account Detail | `/account/[id]` | Single account details and holdings |

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

## Backend

The app connects only to the backend; there is no in-app mock data.

1. Start PostgreSQL and Kafka: `cd services/portfolio-analytics && docker compose up -d`.
2. Start the backend from repo root: `pnpm dev:api` (portfolio-analytics on `http://localhost:8800`; uses `DATABASE_URL` and `KAFKA_BOOTSTRAP_SERVERS` if set).
3. Generate seed data in the database: `pnpm generate-seed-data` (POSTs seed to the backend; backend must be running).
4. The app expects `GET /api/v1/portfolio`. Override with `EXPO_PUBLIC_PORTFOLIO_API_URL` if needed.
5. Pull-to-refresh on the dashboard clears the cache and refetches from the backend.
