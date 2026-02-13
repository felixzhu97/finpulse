# FinPulse TOGAF Enterprise Architecture

> FinPulse fintech analytics platform enterprise architecture views based on the TOGAF framework.  
> Chinese: [docs/zh/togaf/README.md](../../zh/togaf/README.md)  
> C4 model: [docs/en/c4/](../c4/)

## Contents

This directory contains **English** PlantUML diagrams for the four TOGAF architecture domains.

1. [Business Architecture](#business-architecture) — `business-architecture.puml`
2. [Application Architecture](#application-architecture) — `application-architecture.puml`
3. [Data Architecture](#data-architecture) — `data-architecture.puml`
4. [Technology Architecture](#technology-architecture) — `technology-architecture.puml`
5. Finance system domain views: `docs/en/domain/`; Chinese: `docs/zh/domain/`

## Architecture Overview

This document follows **TOGAF (The Open Group Architecture Framework)** and describes FinPulse across four dimensions:

- **Business Architecture**: Business strategy, governance, organization, and key processes
- **Application Architecture**: Applications that support the business and their interactions
- **Data Architecture**: Data assets and data management structures
- **Technology Architecture**: Logical software and hardware capabilities supporting applications and data

## Diagram Reference

### Business Architecture

**File**: `business-architecture.puml`

**Description**: Business architecture including actors, core business domains, and business services.

**Contents**:
- **Actors**: Investors, platform administrators
- **Core domains**: Portfolio management, market analysis, risk management, trading, asset management, watchlist; big data (Spark batch, Flink streaming, Hadoop storage)
- **Business services**: Big data services (Spark session, Flink jobs, HDFS, YARN)

**Value flows**: Portfolio → Risk (assessment); Market → Portfolio (advice); Assets → Portfolio (allocation); Trading → Portfolio (updates); Market/trading data → Big data → Portfolio/Risk (insights).

### Application Architecture

**File**: `application-architecture.puml`

**Description**: Layered application components and their interactions.

**Layers**:
1. **Presentation**: Web (apps/web), mobile (apps/mobile, apps/mobile-portfolio with styled-components for theme-aware UI), UI library (packages/ui), charts
2. **Business Layer**: Portfolio, market data, transaction, risk, user modules
3. **Data Access**: Data services (DAO, cache), state management
4. **External Services**: Portfolio Analytics API, Vercel Analytics, market data API, big data service layer

### Data Architecture

**File**: `data-architecture.puml`

**Description**: Core data entities and relationships.

**Entities**: Portfolio, Asset, Transaction, Market Data, Watch List, Risk Metrics, User Preferences, User; Spark/Flink/Hadoop data entities.

### Technology Architecture

**File**: `technology-architecture.puml`

**Description**: Technology stack, build tools, and deployment.

## How to View Diagrams

```bash
cd docs/en/togaf
plantuml business-architecture.puml application-architecture.puml data-architecture.puml technology-architecture.puml
plantuml -tsvg *.puml
```

Or use [PlantUML online](http://www.plantuml.com/plantuml/uml/) or IDE PlantUML extension.

## Architecture Relationships

```
Business Architecture
  ↓ (drives)
Application Architecture
  ↓ (implements)
Data Architecture
  ↓ (supports)
Technology Architecture
```

---

**Version**: 1.3.0  
**Last updated**: February 2025  
**Maintained by**: FinPulse team

## Recent Updates

- **Redux + styled-components (Mobile Portfolio)**: Portfolio state in Redux (portfolio slice); main screens and list components use styled-components primitives (ScreenRoot, ListRow, CardBordered, SafeAreaScreen, etc.) for theme-aware UI.
- **Clean Architecture (Mobile Portfolio)**: Presentation → Application → Domain; Infrastructure only in DependencyContainer. Shared hooks: **useAsyncLoad**, **runWithLoading**, **useRefreshControl**, **useAccountData**.
- **OOP Architecture**: Native chart code refactored with abstract base classes (`BaseChartViewManager`, `BaseChartView`, `BaseChartRenderer`) and helper classes (ChartLayoutCalculator, ValueFormatter, AxisLabelManager, ChartDataCalculator). Shared utilities: ChartCurve, ChartVertex, ChartPipeline, ChartGrid, ChartThemes.
- **Code Simplification**: Removed unused code (usePerSymbolHistory, duplicate PeriodDataProcessor), simplified logic, improved maintainability through inheritance and abstraction
