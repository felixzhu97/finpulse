# FinPulse C4 Architecture Model

> C4 model diagrams for FinPulse fintech platform.  
> Chinese: [docs/zh/c4/README.md](../../zh/c4/README.md)  
> TOGAF architecture: [docs/en/togaf/](../togaf/)

## Contents

This directory contains **English** C4 PlantUML diagrams.

1. [System Context](#system-context) — `c4-system-context.puml`
2. [Containers](#containers) — `c4-containers.puml`
3. [Portfolio Analytics API Components](#portfolio-analytics-api-components) — `c4-components.puml`
4. [Web App Components](#web-app-components) — `c4-web-app-components.puml`
5. [Mobile Portfolio Components](#mobile-portfolio-components) — `c4-mobile-portfolio-components.puml`
6. [Mobile Demo Components](#mobile-demo-components) — `c4-mobile-demo-components.puml`

## Diagram Reference

### System Context

**File**: `c4-system-context.puml`

**Description**: Investors, platform admin, FinPulse system, external systems (Market Data API, Vercel).

### Containers

**File**: `c4-containers.puml`

**Description**: Web App, Mobile Portfolio, Mobile Demo, Portfolio Analytics API, TimescaleDB, Redis, Kafka.

### Portfolio Analytics API Components

**File**: `c4-components.puml`

**Description**: Portfolio Analytics API internal components (routers, services, repositories, AI providers).

### Web App Components

**File**: `c4-web-app-components.puml`

**Description**: Angular app structure (modules, @fintech/ui, @fintech/utils, charts).

### Mobile Portfolio Components

**File**: `c4-mobile-portfolio-components.puml`

**Description**: Mobile Portfolio app (Expo + React Native): tabs, screens, PortfolioService, QuoteSocket, hooks, native charts, portfolio/account components.

### Mobile Demo Components

**File**: `c4-mobile-demo-components.puml`

**Description**: Mobile Demo app (React Native): tabs, home/cart/categories/profile/product, ApiService, ProductService, stores, UI components.

## How to View Diagrams

```bash
cd docs/en/c4
plantuml c4-system-context.puml c4-containers.puml c4-components.puml c4-web-app-components.puml c4-mobile-portfolio-components.puml c4-mobile-demo-components.puml
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

**Version**: 1.0.0  
**Last updated**: 2025  
**Maintained by**: FinPulse team
