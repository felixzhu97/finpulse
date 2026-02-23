# FinPulse | Fintech Analytics Platform

> Professional-grade financial data analysis and portfolio management platform  
> Chinese documentation: [docs/zh/README.md](docs/zh/README.md)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/felixzhu97s-projects/fintech-project)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## 📋 Project Overview

FinPulse is a modern fintech analytics platform that provides investors with comprehensive portfolio management, market analysis, and risk management capabilities. Built with React (admin, portal), React Native (mobile), and FastAPI/Go backends, the platform delivers a smooth user experience and real-time data visualization.

## ✨ Core Features

### 📊 Portfolio Overview

- Real-time total net asset value display
- Today's profit/loss statistics
- Cumulative return rate tracking
- Active trading monitoring

### 📈 Market Trends Analysis

- Real-time market data visualization
- Multi-dimensional trend charts
- Market dynamics updates

### 💼 Asset Allocation

- Asset distribution visualization
- Portfolio balance analysis
- Support for diverse asset classes

### 📝 Transaction Records

- Recent transaction history
- Transaction details view
- Transaction category filtering

### 📉 Performance Charts

- Portfolio performance visualization
- Historical data playback
- Multi-timeframe analysis

### ⭐ Watch List

- Watchlist asset management
- Price change alerts
- Quick add/remove functionality

### 🛡️ Risk Analysis

- Risk indicator assessment
- Risk distribution visualization
- Risk warning mechanism

### ⚡ Quick Actions

- Quick access to common functions
- One-click operation convenience

## 🛠️ Tech Stack

### Frontend Frameworks

- **React 19 + Vite** - Admin analytics console (`apps/admin`, package `finpulse-admin`)
- **React 19 + Vite** - Portal app (`apps/portal`, package `finpulse-portal`); uses `@fintech/ui` and Tailwind, Robinhood-style
- **React Native + Expo** - Mobile app (`apps/mobile`)
- **React 19.2** - UI components and shared libraries
- **TypeScript 5.0** - Type safety

### Monorepo Tools

- **pnpm Workspaces** - Package and workspace management
- **TypeScript Project References** - Cross-package type checking

### Backend Services

- **Python 3.10+ + FastAPI** - Portfolio analytics API (`apps/server-python`), port 8800. Clean Architecture: `composition.py` (lifespan), `container` (service factories), `crud_helpers` (generic CRUD), `api/config` (cache constants); SQLAlchemy 2.0 + asyncpg; Alembic migrations; config via `.env`. REST resources under `/api/v1/*` with **batch create** (`POST .../batch`) for seeding.
- **Go** - API gateway (`apps/server-go`), port 8801. Serves auth, quotes, instruments; proxies all other routes to Python (8800). Single entry for the app when using `pnpm run start:server`.
- **TimescaleDB (PostgreSQL)** - Portfolio metadata and time-series history (hypertable); Docker, host port 5433
- **Redis** - Cache for portfolio history (Docker, port 6379)
- **Apache Kafka** - Event messaging for portfolio events and real-time market data (Docker, port 9092)
- **AI/ML** - Integrated into business flows (no standalone AI router): `POST /payments` returns fraud detection; `POST /trades` returns surveillance alerts; `POST /customers` returns identity score; `POST /risk-metrics/compute` computes VaR from portfolio history. Optional: Ollama, Hugging Face, TensorFlow for future integrations.
- **One-click start** - `pnpm run start:server` (Docker + API + seed). Seed script uses batch APIs to minimise requests. **API tests** - `pnpm run test:api` (Python pytest); `pnpm run test:api:go` (Go API unit tests). Ollama/HF/TF tests may skip if services unavailable; Hugging Face first run can take 1–3 min.

### UI & Visualization

- **Radix UI** - Unstyled, accessible component primitives (in `@fintech/ui`)
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Lucide React** - Icon library
- **recharts + ag-grid-react** - Admin console charts and data grids; **Chart.js + chartjs-chart-financial** - Financial (candlestick) where used
- **react-native-wagmi-charts** - Professional mobile stock charts (line, candlestick, crosshair)
- **react-native-chart-kit** - Lightweight mobile charts for portfolio metrics
- **styled-components** - Theme-aware styled components for mobile (Expo/React Native); `StyledThemeProvider`, primitives (Card, LabelText, ValueText, HelperText), `withTheme` for type-safe theme access

### Utility Libraries

- **React Hook Form** - Form management
- **Zod** - Data validation
- **date-fns** - Date handling
- **next-themes** - Theme switching
- **clsx** & **tailwind-merge** - Style utilities (in `@fintech/utils` package)

### Deployment & Analytics

- **Vercel** - Deployment platform
- **Vercel Analytics** - Website analytics

## 🏗️ Project Architecture

This project uses a **monorepo** architecture managed with pnpm workspaces:

- **apps/admin** - React (Vite) admin analytics console (package name: `finpulse-admin`).
- **apps/portal** - React (Vite) portal app (package name: `finpulse-portal`); Robinhood-style UI with `@fintech/ui`, dev server port 3001.
- **apps/mobile** - React Native (Expo) mobile app for portfolio overview and metrics; **Stocks** screen with real-time prices and per-stock sparklines (NativeSparkline, useSymbolDisplayData); **Account** tab with Quick trade, Send ETH (real Ethereum via Sepolia testnet by default), Connect/Disconnect wallet (Redux web3 slice, web3Service). Quote history uses **batch API** (`getQuotesHistoryBatch`) for fewer requests. Native views **NativeDemoCard** and six native charts: **NativeLineChart**, **NativeCandleChart**, **NativeAmericanLineChart**, **NativeBaselineChart**, **NativeHistogramChart**, **NativeLineOnlyChart** (Metal on iOS, OpenGL ES on Android). Native code follows OOP principles: iOS uses **ChartSupport** (ChartCurve, ChartVertex, ChartPipeline, ChartGrid, ChartThemes) and OOP helper classes; Android uses **view/chart/**, **view/sparkline/**, **view/democard/**. Charts support theme (light/dark), tooltips, x-axis labels, full-width rendering, and horizontal drag-to-scroll via `useScrollableChart` and `ScrollableChartContainer`.
- **apps/server-python** - Python FastAPI backend (Clean Architecture: composition, container, crud_helpers); PostgreSQL; Kafka; REST resources + batch create; AI/ML (VaR, fraud, surveillance, sentiment, identity, forecast); config via `.env.example`; `pnpm run start:server`; `pnpm run test:api`.
- **apps/server-go** - Go non-AI API (health, quotes, instruments); same DB as server-python; port 8801.
- **packages/ui** - Shared UI component library.
- **packages/utils** - Shared utility function library.

Benefits of this architecture:
- Code reuse: Shared components and utilities can be used across multiple applications.
- Independent development: Each package can be developed, tested, and versioned independently.
- Type safety: Cross-package type checking through TypeScript project references.
- Efficient builds: Only build changed packages, improving development efficiency.

## 🚀 Quick Start

### Requirements

- Node.js 18+
- pnpm 10.6.0+ (required, project uses pnpm workspaces)
- Python 3.10+ (for backend FastAPI service)
- Go 1.22+ (optional, for `apps/server-go`)
- Docker (for PostgreSQL and Kafka when using `pnpm run start:server`)

### Install Dependencies

```bash
# Install all dependencies in the project root (including all packages)
pnpm install
```

pnpm will automatically recognize the `pnpm-workspace.yaml` configuration and install dependencies for all workspaces.

**Root scripts** (from repo root): `dev` (admin, port 4200), `dev:portal` (portal at :3001), `dev:finpulse-mobile`, `dev:finpulse-mobile:ios`, `dev:finpulse-mobile:android`, `start:server` (Docker + Python :8800 + Go gateway :8801 + seed; app uses Go as single entry), `start:server:go` (Go API only), `start:kafka`, `build`, `start`, `test` (= test:api), `test:api` (Python pytest), `test:api:go` (Go tests), `lint`, `stop:backend`.

### Development Mode

```bash
# Start admin application development server
pnpm dev

# Or run directly
pnpm --filter finpulse-admin dev
```

Visit [http://localhost:4200](http://localhost:4200) to view the admin application.

### Portal app (portal)

React + Vite portal using `@fintech/ui` and Tailwind (Robinhood-style). Dev server on port 3001.

```bash
pnpm dev:portal
# Or: pnpm --filter finpulse-portal dev
```

Visit [http://localhost:3001](http://localhost:3001).

### Mobile app (finpulse-mobile)

Expo + React Native app with native iOS/Android views. Uses `requireNativeComponent` for **NativeDemoCard** and **NativeLineChart**.

```bash
# Start Metro bundler
pnpm dev:finpulse-mobile

# Run on iOS simulator (builds native app and launches simulator)
pnpm --filter finpulse-mobile ios

# Run on Android emulator
pnpm --filter finpulse-mobile android
```

Native UI: **iOS** `ios/mobileportfolio/` — ChartSupport (ChartCurve, ChartVertex, ChartPipeline, ChartGrid, ChartThemes), per-chart folders (NativeLineChart, NativeCandleChart, etc.), NativeSparkline, NativeDemoCard. **Android** `android/.../view/` — chart/ (ChartGl, ChartCurve, *ChartTheme), sparkline/, democard/, plus chart View/ViewManager classes; NativeViewsPackage. **JS** `src/components/native/` — wrappers, useScrollableChart, ScrollableChartContainer, chartTooltip.

### Backend service (Python FastAPI + Kafka/Flink-ready market data)

**One-click start (from repo root):**

```bash
pnpm run start:server
```

This starts Docker (PostgreSQL + Kafka), the Python API at `http://127.0.0.1:8800`, then the Go gateway at `http://127.0.0.1:8801` (proxies unimplemented routes to Python), and seeds via Go. **Use `http://127.0.0.1:8801` as the single entry** in the app. Logs: `tail -f /tmp/portfolio-api.log` (Python), `tail -f /tmp/portfolio-api-go.log` (Go).

**Manual setup:**

```bash
cd apps/server-python
cp .env.example .env   # optional: edit .env for DB, Kafka, Ollama, HF model
docker compose up -d
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8800 --reload
```

Run API tests: `pnpm run test:api` (Python) or `pnpm run test:api:go` (Go) from repo root; or `pytest tests -v` / `go test ./cmd/server -v` from the respective service directory.

`pnpm run start:server` starts Docker, Python (8800), and Go gateway (8801), then runs the seed script. The mobile app uses `http://localhost:8801` by default (single entry; Go handles auth, quotes, instruments and proxies portfolio/customers etc. to Python). Run `pnpm dev:finpulse-mobile` and pull-to-refresh to load data. To seed manually: `PORTFOLIO_API_URL=http://127.0.0.1:8801 node scripts/seed/generate-seed-data.js`.

### Real-time market data (DB + WebSocket)

The platform supports real-time market data for the mobile portfolio app using the database and a WebSocket endpoint:

- **Market data pipeline**
  - When the backend starts, `MockQuoteWriter` produces to Kafka; `KafkaQuoteConsumer` consumes and writes to DB + Redis. If Kafka is unavailable, `MockQuoteWriter` falls back to direct DB write.
  - TimescaleDB: `quote_tick` hypertable with batch inserts; `quote_ohlc_1min` and `quote_ohlc_5min` continuous aggregates; 7-day compression policy.
  - `CachedMarketDataProvider` uses Redis read-through and write-through; `MarketDataService` exposes them via:
    - `GET /api/v1/quotes?symbols=AAPL,MSFT`
    - WebSocket `/ws/quotes` (`{"type":"subscribe","symbols":["AAPL","MSFT"]}` → `{"type":"snapshot","quotes":{...}}`).
- **Mobile integration**
  - Watchlist loads **history first** via REST (`getQuotesHistoryBatch` and `getQuotes`); each response dispatches to Redux as soon as it arrives. **WebSocket** subscribes only after `historyLoaded` is set, so real-time updates start after history is rendered.
  - Subscription is **visible-only**: only symbols in the current viewport (and the open stock-detail symbol) are sent to `/ws/quotes`. Refresh interval 1s. Redux: `quotes`, `history`, `historyLoaded`, `subscribedSymbols`, `extraSubscribedSymbols`; store uses `serializableCheck.ignoredPaths` for large quote/history state.
  - List rows use a memoized **WatchlistRow** and stable callbacks to keep VirtualizedList updates fast.

Quick local setup:

```bash
# 1) Start backend (Docker: Postgres, Redis; API with built-in mock quote writer)
pnpm run start:server

# 2) Start mobile portfolio
pnpm dev:finpulse-mobile:ios
```

No Kafka is required for real-time quotes; the mock writer persists data to the DB automatically when the API starts.

### Backend service (Go, non-AI)

Go gateway (start:server runs it; single entry :8801, proxies to Python :8800):

```bash
pnpm run start:server:go
```

From `apps/server-go`: `make deps` then `go run ./cmd/server` (or `make build` and `./bin/server`). Run Go API tests: `pnpm run test:api:go`.

### Build Production Version

```bash
# Build admin application
pnpm build

# Or build app(s)
pnpm --filter finpulse-admin build
pnpm --filter finpulse-portal build
pnpm --filter finpulse-mobile build

# Start production server
pnpm start
```

### Code Linting

```bash
# Run ESLint (in admin application)
pnpm lint

# Or run lint for specific app
pnpm --filter finpulse-admin lint
```

### Workspace Scripts

```bash
# Run scripts in specific packages
pnpm --filter finpulse-admin <script>
pnpm --filter finpulse-portal <script>
pnpm --filter finpulse-mobile <script>
pnpm --filter @fintech/ui <script>
pnpm --filter @fintech/utils <script>

# Run scripts in all packages
pnpm -r <script>

# View workspace information
pnpm list -r
```

### Development Guide

#### Adding New Dependencies

```bash
# Add dependencies to specific packages
pnpm --filter finpulse-admin add <package>
pnpm --filter finpulse-portal add <package>
pnpm --filter finpulse-mobile add <package>
pnpm --filter @fintech/ui add <package>
pnpm --filter @fintech/utils add <package>

# Add dev dependencies
pnpm --filter finpulse-admin add -D <package>
```

#### Adding Dependencies Between Packages

If the admin app (`apps/admin`, package name `finpulse-admin`) needs to use `@fintech/ui`, add to `apps/admin/package.json`:

```json
{
  "dependencies": {
    "@fintech/ui": "workspace:*"
  }
}
```

Then run `pnpm install`.

#### Type Checking

```bash
# Check types for all packages
pnpm -r type-check

# Check types for specific packages
pnpm --filter @fintech/ui type-check
pnpm --filter @fintech/utils type-check
```

## 📁 Project Structure

```
finpulse/
├── apps/
│   ├── admin/                     # React (Vite) admin analytics console (finpulse-admin)
│   ├── portal/                    # React (Vite) portal app (finpulse-portal), port 3001
│   ├── mobile/         # React Native (Expo) portfolio mobile app
│   ├── server-python/      # Python FastAPI, PostgreSQL, Kafka, AI/ML
│   └── server-go/         # Go (Gin) non-AI API; DDD; same DB; port 8801
├── scripts/
│   ├── backend/start-backend.sh  # One-click: Docker (Postgres, Kafka) + Python API + seed
│   ├── seed/generate-seed-data.js # Seed via batch APIs (run by start:server or manually)
│   └── db/                       # Schema and seed SQL
├── packages/
│   ├── ui/                       # Shared UI (@fintech/ui)
│   └── utils/                    # Shared utils (@fintech/utils)
├── docs/
│   ├── en/                       # English: togaf/, c4/, domain/, er-diagram/
│   └── zh/                       # Chinese: 架构、C4、领域、ER 图
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

### Package Descriptions

#### `apps/admin`
React (Vite) admin analytics console. Uses `recharts` for performance and allocation charts, `ag-grid-react` for data grids. Depends on `@fintech/ui` and `@fintech/utils`.

#### `apps/portal`
React (Vite) portal app with Robinhood-style UI. Uses `@fintech/ui`, `@fintech/utils`, Tailwind CSS 4, and React 19. Dev server runs on port 3001 (`pnpm dev:portal`).

#### `apps/mobile`
Expo + React Native app for portfolio overview, net worth trend, asset allocation, and stock charts. **Layering**: domain (entities, dto), infrastructure (api + network + services + config/web3Config), presentation (hooks, Redux: quotes with **historyLoaded**, preferences, portfolio, **web3**). **Account** tab: Quick trade, Send ETH (Sepolia default), Connect/Disconnect wallet (WalletConnectButton, Redux web3, web3Service). **Watchlist**: history fetched first (getQuotesHistoryBatch + getQuotes, dispatch on each response); WebSocket starts after history loaded; **visible-only** subscription + 1s refresh; **WatchlistRow** (memo) for list performance; **NativeSparkline** shows baseline only when no data. Native charts (Metal/OpenGL ES): NativeLineChart (gradient in light theme), NativeCandleChart, etc.; **NativeSparkline**; JS: `useScrollableChart`, `ScrollableChartContainer`. Redux middleware: `serializableCheck.ignoredPaths` for quotes/history. Seed script: **dedupeInstrumentsBySymbol** so instruments have unique symbols.

#### `packages/ui`
Shared UI component library, a collection of components built on Radix UI and Tailwind CSS. Can be reused across multiple applications.

#### `packages/utils`
Shared utility function library containing common utility functions (such as `cn` for style merging).

## 📚 Documentation

- **TOGAF Architecture** – `docs/en/rd/togaf/` (English), `docs/zh/rd/togaf/` (中文) – Business, Application, Data, and Technology architecture diagrams (PlantUML)
- **C4 Model** – `docs/en/rd/c4/` (English), `docs/zh/rd/c4/` (中文) – C4 architecture diagrams (PlantUML)
- **ER Diagram** – `docs/en/data/er-diagram/`, `docs/zh/data/er-diagram/` – Entity-relationship diagram for the fintech data model
- **TODO** – `docs/en/TODO.md`, `docs/zh/TODO.md` – Cross-cutting TODO list for architecture, web, mobile, and shared packages

## 🗺️ Roadmap & TODO

High-level tasks and roadmap items for the whole monorepo are tracked in `docs/en/TODO.md` and `docs/zh/TODO.md`. Before each significant release, review those files together with the architecture documents under `docs/en/rd/togaf`, `docs/en/rd/c4`, `docs/zh/rd/togaf`, and `docs/zh/rd/c4` and update items as work is completed.

## 🎨 Design Features

- **Modern UI** - Glassmorphism design with smooth animations
- **Responsive Layout** - Perfect adaptation to various screen sizes
- **Dark Theme** - Default dark mode; finpulse-mobile uses black (#000000) background and dark chart/card surfaces with light text
- **Accessibility** - Follows WCAG standards for good accessibility
- **Performance Optimization** - Angular build optimization and lazy loading for fast loading

## 📦 Main Component Descriptions

### PortfolioOverview

Displays key metrics such as total net asset value, today's profit/loss, cumulative return rate, and active trading.

### MarketTrends

Provides visual analysis of market trends to help users understand market dynamics.

### AssetAllocation

Displays asset allocation in chart form, supporting multiple visualization methods such as pie charts and bar charts.

### PerformanceChart (web)

Uses `chart.js` via `ng2-charts` to draw historical performance curves of the portfolio.

### StockChart (web)

Uses `chart.js` + `chartjs-chart-financial` to render candlestick stock charts for price history.

### ProfessionalStockChart (mobile)

Uses `react-native-wagmi-charts` to provide interactive mobile stock charts (price line, candlestick, crosshair, price/time labels).

### RiskAnalysis

Displays risk indicators and risk distribution to help users with risk management.

### RecentTransactions

Shows recent transaction records with support for filtering and detail viewing.

### WatchList

Manages user's watchlist assets, displaying real-time price changes.

## 🌐 Deployment

The project is configured for automatic deployment to Vercel. Each push to the main branch automatically triggers deployment.

### Vercel Configuration

Since the project uses a monorepo structure, configuration is required in Vercel:

1. **Root Directory**: `/`
2. **Build Command**: `pnpm install && pnpm --filter finpulse-admin build`
3. **Output Directory**: `apps/admin/dist`
4. **Install Command**: `pnpm install`

### Manual Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure build settings (root directory, build command, etc.)
4. Configure environment variables (if needed)
5. Deployment complete

### Local Production Preview

```bash
# Build production version
pnpm build

# Start production server
pnpm start
```

## 📄 License

This project is private.

## 👥 Contributing

Issues and Pull Requests are welcome!

## 📞 Contact

For questions or suggestions, please contact us through GitHub Issues.

---

**Note**: This project uses [v0.app](https://v0.app) for some development and deployment management.
