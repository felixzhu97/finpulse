# FinPulse | Fintech Analytics Platform

> Professional-grade financial data analysis and portfolio management platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/felixzhu97s-projects/fintech-project)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## 📋 Project Overview

FinPulse is a modern fintech analytics platform that provides investors with comprehensive portfolio management, market analysis, and risk management capabilities. Built with Next.js, the platform delivers a smooth user experience and real-time data visualization.

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

- **Angular 21** - Web analytics console (`apps/web`)
- **React Native + Expo** - Mobile apps (`apps/mobile`, `apps/mobile-portfolio`)
- **React 19.2** - UI components and shared libraries
- **TypeScript 5.0** - Type safety

### Monorepo Tools

- **pnpm Workspaces** - Package and workspace management
- **TypeScript Project References** - Cross-package type checking

### Backend Services

- **Python 3.10+ + FastAPI** - Portfolio analytics API (`services/portfolio-analytics`)

### UI & Visualization

- **Radix UI** - Unstyled, accessible component primitives (in `@fintech/ui`)
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Chart.js + ng2-charts + chartjs-chart-financial** - Web charts and financial (candlestick) charts
- **react-native-wagmi-charts** - Professional mobile stock charts (line, candlestick, crosshair)
- **react-native-chart-kit** - Lightweight mobile charts for portfolio metrics

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

- **apps/web** - Angular-based financial analytics web console.
- **apps/mobile** - React Native demo mobile app.
- **apps/mobile-portfolio** - React Native (Expo) mobile app for portfolio overview and metrics; includes native views **NativeDemoCard** (demo card) and **NativeLineChart** (Metal/OpenGL ES line chart) with touch interaction and scroll lock.
- **services/portfolio-analytics** - Python FastAPI backend using DDD to serve portfolio analytics.
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

### Install Dependencies

```bash
# Install all dependencies in the project root (including all packages)
pnpm install
```

pnpm will automatically recognize the `pnpm-workspace.yaml` configuration and install dependencies for all workspaces.

### Development Mode

```bash
# Start web application development server
pnpm dev

# Or run directly
pnpm --filter finpulse-web dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Mobile app (mobile-portfolio)

Expo + React Native app with native iOS/Android views. Uses `requireNativeComponent` for **NativeDemoCard** and **NativeLineChart**.

```bash
# Start Metro bundler
pnpm dev:mobile-portfolio

# Run on iOS simulator (builds native app and launches simulator)
pnpm --filter mobile-portfolio ios

# Run on Android emulator
pnpm --filter mobile-portfolio android
```

Native UI: `ios/mobileportfolio/NativeDemoCard/`, `ios/mobileportfolio/NativeLineChart/` (Metal for chart); `android/.../view/` (NativeDemoCardView, NativeLineChartView, NativeViewsPackage). JS wrappers: `src/components/native/NativeDemoCard.tsx`, `NativeLineChart.tsx`.

### Backend service (Python FastAPI)

```bash
cd services/portfolio-analytics
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

The mobile portfolio app will call:

- `GET http://localhost:8080/api/v1/portfolio`

### Build Production Version

```bash
# Build web application
pnpm build

# Or build all packages
pnpm --filter "./apps/*" build

# Start production server
pnpm start
```

### Code Linting

```bash
# Run ESLint (in web application)
pnpm lint

# Or run lint for all packages
pnpm --filter "./apps/*" lint
```

### Workspace Scripts

```bash
# Run scripts in specific packages
pnpm --filter web <script>
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
pnpm --filter web add <package>
pnpm --filter @fintech/ui add <package>
pnpm --filter @fintech/utils add <package>

# Add dev dependencies
pnpm --filter web add -D <package>
```

#### Adding Dependencies Between Packages

If `apps/web` needs to use `@fintech/ui`, simply add to `apps/web/package.json`:

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
fintech-project/
├── apps/
│   ├── web/                      # Angular financial analytics web app
│   ├── mobile/                   # React Native mobile demo app
│   └── mobile-portfolio/         # React Native portfolio overview mobile app
├── services/
│   └── portfolio-analytics/      # Python FastAPI portfolio analytics service (DDD)
├── packages/
│   ├── ui/                       # UI component library (@fintech/ui)
│   └── utils/                    # Utility function library (@fintech/utils)
├── docs/                         # Architecture and domain documentation
├── package.json                  # Root package.json (workspaces configuration)
├── pnpm-workspace.yaml           # pnpm workspaces configuration
├── pnpm-lock.yaml                # Dependency lock file
└── tsconfig.json                 # Root TypeScript configuration
```

### Package Descriptions

#### `apps/web`
Angular-based financial analytics web console. Uses `chart.js`/`ng2-charts` for performance charts and `chartjs-chart-financial` for candlestick stock charts. Depends on `@fintech/ui` and `@fintech/utils`.

#### `apps/mobile-portfolio`
Expo + React Native app for portfolio overview, net worth trend, asset allocation, and stock charts. Native views: **NativeDemoCard** (demo native card; RCTViewManager / SimpleViewManager) and **NativeLineChart** (portfolio/values line chart; Metal on iOS, OpenGL ES on Android—light theme, grid, touch crosshair and tooltip, scroll lock via `onInteractionStart` / `onInteractionEnd`). Exposed via `requireNativeComponent`; wrappers in `src/components/native/`.

#### `packages/ui`
Shared UI component library, a collection of components built on Radix UI and Tailwind CSS. Can be reused across multiple applications.

#### `packages/utils`
Shared utility function library containing common utility functions (such as `cn` for style merging).

## 🗺️ Roadmap & TODO

High-level tasks and roadmap items for the whole monorepo are tracked in:

- `docs/TODO.md` – cross-cutting TODO list for architecture, web, mobile, big data services, and shared packages.

Before each significant release, review that file together with the architecture documents under `docs/architecture` and update items as work is completed.

## 🎨 Design Features

- **Modern UI** - Glassmorphism design with smooth animations
- **Responsive Layout** - Perfect adaptation to various screen sizes
- **Dark Theme** - Default dark mode to reduce eye strain
- **Accessibility** - Follows WCAG standards for good accessibility
- **Performance Optimization** - Next.js SSR/SSG optimization for fast loading

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
2. **Build Command**: `pnpm --filter web build`
3. **Output Directory**: `apps/web/.next`
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
