# FinPulse Admin (React + Vite)

React (Vite) admin analytics console for the FinPulse fintech platform.

## Prerequisites

- Node.js 18+
- pnpm 10.6.0+

## Installation

```bash
# Install dependencies from project root
pnpm install
```

## Development

```bash
# Start development server (from repo root)
pnpm dev
# or
pnpm --filter finpulse-admin dev

# The application will be available at http://localhost:4200
```

## Build

```bash
# Build for production (from repo root)
pnpm build
# or
pnpm --filter finpulse-admin build

# The build artifacts will be stored in the dist/ directory
```

## Project Structure

```
src/
├── components/           # Layout and shared components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── dashboard/       # Dashboard widgets
├── pages/               # Route pages
│   ├── Dashboard.tsx
│   ├── Portfolio.tsx
│   ├── Transactions.tsx
│   ├── Clients.tsx
│   └── Reports.tsx
├── shared/              # Shared config (e.g. ag-grid theme)
├── App.tsx
├── main.tsx
└── styles.css
```

## Features

- **Portfolio Overview**: Real-time portfolio metrics and statistics
- **Market Trends**: Live market data visualization
- **Asset Allocation**: Portfolio distribution charts (recharts)
- **Performance Charts**: Historical performance tracking (recharts)
- **Recent Transactions**: Transaction history
- **Watch List**: Stock watchlist management
- **Risk Analysis**: Risk metrics and analysis
- **Quick Actions**: Common operation shortcuts
- **Data grids**: Portfolio, Transactions, Clients, Reports (ag-grid-react)

## Technology Stack

- **React 19**: UI library
- **Vite 6**: Build tool and dev server
- **React Router 7**: Routing
- **TypeScript**: Type safety
- **Emotion** (@emotion/react, @emotion/styled): Robinhood-style styling
- **@fintech/ui**: Shared UI components (Radix-based)
- **recharts**: Charts
- **ag-grid-react**: Data grids
