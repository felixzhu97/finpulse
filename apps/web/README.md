# FinPulse Web Application (Angular)

This is the Angular version of the FinPulse fintech analytics platform.

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
# Start development server
pnpm dev
# or
ng serve

# The application will be available at http://localhost:4200
```

## Build

```bash
# Build for production
pnpm build
# or
ng build

# The build artifacts will be stored in the `dist/web` directory
```

## Project Structure

```
src/
├── app/
│   ├── components/          # Business components
│   │   ├── sidebar/
│   │   ├── header/
│   │   ├── portfolio-overview/
│   │   ├── market-trends/
│   │   ├── asset-allocation/
│   │   ├── performance-chart/
│   │   ├── recent-transactions/
│   │   ├── watch-list/
│   │   ├── risk-analysis/
│   │   └── quick-actions/
│   ├── pages/               # Page components
│   │   └── dashboard/
│   ├── shared/             # Shared UI components
│   │   └── components/
│   │       ├── button/
│   │       ├── card/
│   │       ├── input/
│   │       ├── badge/
│   │       ├── progress/
│   │       └── avatar/
│   ├── app.component.ts    # Root component
│   └── app.routes.ts       # Routes configuration
├── index.html
├── main.ts
└── styles.css
```

## Features

- **Portfolio Overview**: Real-time portfolio metrics and statistics
- **Market Trends**: Live market data visualization
- **Asset Allocation**: Portfolio distribution charts
- **Performance Charts**: Historical performance tracking
- **Recent Transactions**: Transaction history
- **Watch List**: Stock watchlist management
- **Risk Analysis**: Risk metrics and analysis
- **Quick Actions**: Common operation shortcuts

## Technology Stack

- **Angular 19**: Frontend framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Standalone Components**: Modern Angular architecture
