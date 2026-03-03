# FinPulse | Fintech Analytics Platform

Professional-grade financial data analysis and portfolio management platform.

Chinese docs: [docs/zh/README.md](docs/zh/README.md)

## Overview

FinPulse provides portfolio management, market analysis, and risk management. Built with React (admin, portal), React Native (mobile), and FastAPI/Go backends.

## Screenshots

### Mobile
<p align="center">
  <img src="./screenshots/finpulse-mobile-dashboard.png" width="200" alt="Mobile Dashboard">
  <img src="./screenshots/finpulse-mobile-watchlist.png" width="200" alt="Mobile Watchlist">
  <img src="./screenshots/finpulse-mobile-stock-detail.png" width="200" alt="Mobile Stock Detail">
</p>
<p align="center">
  <img src="./screenshots/finpulse-mobile-insights.png" width="200" alt="Mobile Insights">
  <img src="./screenshots/finpulse-mobile-account.png" width="200" alt="Mobile Account">
  <img src="./screenshots/finpulse-mobile-new-payment.png" width="200" alt="Mobile New Payment">
</p>

### Admin
<p align="center">
  <img src="./screenshots/finpulse-admin-dashboard.png" width="280" alt="Admin Dashboard">
  <img src="./screenshots/finpulse-admin-portfolio.png" width="280" alt="Admin Portfolio">
  <img src="./screenshots/finpulse-admin-transactions.png" width="280" alt="Admin Transactions">
  <img src="./screenshots/finpulse-admin-clients.png" width="280" alt="Admin Clients">
</p>

## Tech Stack

- **Frontend**: React 19 + Vite, React Native + Expo, Emotion, Radix UI
- **Packages**: `@fintech/analytics` (behavior tracking, A/B via GrowthBook), `@fintech/ui`, `@fintech/utils`
- **Backend**: Python FastAPI (analytics, portfolio aggregate, quotes, behavior events, AI/ML), Go (gateway + CRUD: auth, blockchain, customers, accounts, portfolios, instruments, bonds, options, watchlists, orders, trades, payments, settlements, market-data, user-preferences), TimescaleDB, Redis, Kafka
- **Tools**: pnpm workspaces, TypeScript 5

## Quick Start

**Requirements**: Node 18+, pnpm 10.6+, Python 3.10+, Docker

```bash
pnpm install
pnpm dev              # Admin @ localhost:4200
pnpm dev:portal       # Portal @ localhost:3001
pnpm dev:finpulse-mobile   # Mobile (Expo)
pnpm run start:server # Backend (Docker + Python :8800 + Go :8801 + seed)
```

Use `http://127.0.0.1:8801` as API entry when backend is running. For Admin behavior view, set `VITE_API_BASE_URL` (e.g. `http://127.0.0.1:8801/api/v1` or leave default for dev proxy). For Mobile analytics, set `EXPO_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8801`; `/api/v1` is appended automatically).

## Behavior Analytics

Portal, Admin, and Mobile use `@fintech/analytics`: `AnalyticsProvider` + `useAnalytics().track()` / `identify()`. Events are sent to `POST /api/v1/analytics/events` (Console transport in dev if no API base). Admin **Behavior** page (`/behavior`) lists events and shows user detail (userId, email, name) in a drawer on row click.

## Project Structure

```
finpulse/
├── apps/
│   ├── admin/         # React admin console
│   ├── portal/        # React portal app
│   ├── mobile/        # React Native (Expo) app
│   ├── server-python/ # FastAPI backend
│   └── server-go/     # Go API gateway
├── packages/
│   ├── analytics/     # @fintech/analytics (track, identify, GrowthBook A/B, console/HTTP transport)
│   ├── ui/            # @fintech/ui
│   └── utils/         # @fintech/utils
├── scripts/           # Backend start, seed, db
└── docs/              # Architecture, C4, ER diagrams
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Admin dev server |
| `pnpm dev:portal` | Portal dev server |
| `pnpm dev:finpulse-mobile` | Mobile Metro |
| `pnpm run start:server` | Backend (Docker + API + seed) |
| `pnpm build` | Build admin |
| `pnpm test:api` | Python API tests |
| `pnpm lint` | ESLint |

## Docs

- **Architecture**: `docs/en/rd/togaf/`, `docs/en/rd/c4/`
- **ER Diagram**: `docs/en/data/er-diagram/`
- **TODO**: `docs/en/TODO.md`

## Deploy (Vercel)

- Root: `/`
- Build: `pnpm install && pnpm --filter finpulse-admin build`
- Output: `apps/admin/dist`

## License

Private. Issues and PRs welcome.
