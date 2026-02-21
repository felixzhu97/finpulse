# FinPulse C4 Architecture Model

> C4 model diagrams for FinPulse fintech platform.  
> Chinese: [docs/zh/c4/README.md](../../zh/c4/README.md)  
> TOGAF architecture: [docs/en/togaf/](../togaf/)

## Contents

This directory contains **English** C4 PlantUML diagrams.

1. [System Context](#system-context) — `c4-system-context.puml`
2. [Containers](#containers) — `c4-containers.puml`
3. [Portfolio Analytics API Components](#portfolio-analytics-api-components) — `c4-components.puml`
4. [Clean Architecture (Portfolio API)](#clean-architecture-portfolio-api) — `clean-architecture-portfolio-api.puml`
5. [Web App Components](#web-app-components) — `c4-web-app-components.puml`
6. [Mobile Portfolio Components](#mobile-portfolio-components) — `c4-mobile-portfolio-components.puml`

## Diagram Reference

### System Context

**File**: `c4-system-context.puml`

**Description**: Investors, platform admin, FinPulse system, external systems (Market Data API, Vercel).

### Containers

**File**: `c4-containers.puml`

**Description**: Web App, Mobile Portfolio, Portfolio Analytics API, TimescaleDB, Redis, Kafka.

### Portfolio Analytics API Components

**File**: `c4-components.puml`

**Description**: Portfolio Analytics API internal components: Portfolio Router (GET /portfolio, POST /seed), Resource Router (/api/v1/* CRUD and batch; AI integrated in payments, trades, customers, risk-metrics), Quotes Router (GET /quotes, GET /quotes/history, WebSocket /ws/quotes); services (Portfolio, Analytics, Market Data, Quote History); RealtimeQuoteRepository (ORM, IRealtimeQuoteRepository); Kafka Quote Consumer. The backend follows Clean Architecture (see diagram below and `services/portfolio-analytics/README.md`).

### Clean Architecture (Portfolio API)

**File**: `clean-architecture-portfolio-api.puml`

**Description**: Clean Architecture layers for the Portfolio Analytics API: API (composition root, endpoints, schemas, mappers) → Infrastructure (database, config, external services, message brokers) → Application (use cases, ports) → Domain (entities, value objects, events). Dependency rule: inner layers do not depend on outer layers; only the composition root wires infrastructure to application ports.

### Web App Components

**File**: `c4-web-app-components.puml`

**Description**: Angular app structure (modules, @fintech/ui, @fintech/utils, charts).

### Mobile Portfolio Components

**File**: `c4-mobile-portfolio-components.puml`

**Description**: Mobile Portfolio app (Expo + React Native): **Presentation** (hooks by domain: portfolio, market, account, risk, blockchain, common; screens, Redux, theme, i18n) calls **Infrastructure** directly—**API module** (by domain: portfolio, market, account, risk, blockchain; getPortfolioData, getQuotes, getWatchlists, getAccountData, getRiskMetrics, getBlockchainBalance, etc.) and **quoteStreamService** (WebSocket subscribe); no application layer or container. **Domain** is entities + DTOs only. **Infrastructure** also has HttpClient, createQuoteSocket, web3Service. Redux Toolkit (quotes with subscribedSymbols + extraSubscribedSymbols, preferences, portfolio); styled-components (ScreenRoot, ListRow, CardBordered, etc.); QuoteSocketSubscriber uses quoteStreamService; backend: GET /api/v1/portfolio, GET /api/v1/quotes, WS /ws/quotes, etc.

## How to View Diagrams

```bash
cd docs/en/c4
plantuml c4-system-context.puml c4-containers.puml c4-components.puml clean-architecture-portfolio-api.puml c4-web-app-components.puml c4-mobile-portfolio-components.puml
plantuml -tsvg *.puml
```

Or use [PlantUML online](http://www.plantuml.com/plantuml/uml/) or IDE PlantUML extension.

## Offline / Local C4 Library

Diagrams use the local C4 library in `docs/c4-lib/`. If you see "Cannot open URL", populate it:

```bash
cd docs/c4-lib
git clone https://github.com/plantuml-stdlib/C4-PlantUML.git .
```

After setup, diagrams render without network access.

---

**Version**: 1.1.0  
**Last updated**: February 2025  
**Maintained by**: FinPulse team

## Recent Updates

- **Redux optimization (Mobile)**: Unified quotes via Redux; extraSubscribedSymbols for drawer; single WebSocket; useAppSelector/useAppDispatch; removed useRealtimeQuotes.
- **Redux + styled-components (Mobile)**: Portfolio state in Redux; main screens and list components use styled-components primitives.
- **OOP Architecture**: Native chart code refactored with abstract base classes (`BaseChartViewManager`, `BaseChartView`, `BaseChartRenderer`) and helper classes (ChartLayoutCalculator, ValueFormatter, AxisLabelManager, ChartDataCalculator). Shared utilities: ChartCurve, ChartVertex, ChartPipeline, ChartGrid, ChartThemes.
- **Code Simplification**: Removed unused code, simplified logic, improved maintainability through inheritance and abstraction
- **Chart Layout**: Charts now render full-width with no left padding, extending to the far left edge
- **Period Data Processing**: PeriodDataProcessor class encapsulates period filtering and volume matching logic
