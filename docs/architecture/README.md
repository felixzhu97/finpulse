# FinPulse TOGAF Enterprise Architecture

> FinPulse fintech analytics platform enterprise architecture views based on the TOGAF framework.  
> 中文文档（含中文版图表）：[doc_zh/architecture/README.md](../../doc_zh/architecture/README.md)

## Contents

This directory contains **English** PlantUML diagrams for the four TOGAF architecture domains. Chinese versions (docs + diagrams) are under `doc_zh/architecture/`.

1. [Business Architecture](#business-architecture) — `business-architecture.puml`
2. [Application Architecture](#application-architecture) — `application-architecture.puml`
3. [Data Architecture](#data-architecture) — `data-architecture.puml`
4. [Technology Architecture](#technology-architecture) — `technology-architecture.puml`
5. Finance system domain views (`docs/domain`; Chinese: `doc_zh/domain/`)

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
1. **Presentation**
   - Web: `apps/web` (Angular financial analytics console)
   - Mobile: `apps/mobile`, `apps/mobile-portfolio` (React Native; mobile-portfolio uses Expo)
   - **Native UI (mobile-portfolio)**: **NativeDemoCard** and six native charts (NativeLineChart, NativeCandleChart, NativeAmericanLineChart, NativeBaselineChart, NativeHistogramChart, NativeLineOnlyChart). Metal (iOS) / OpenGL ES (Android); theme (light/dark), tooltips, x-axis, drag-to-scroll. Shared: `useScrollableChart`, `ScrollableChartContainer`, `chartTooltip`. Code: `ios/mobileportfolio/*Chart/`, `android/.../view/`, `src/components/native/`.
   - UI library: `packages/ui`
   - Charts: Chart.js, ng2-charts, chartjs-chart-financial, react-native-chart-kit, react-native-wagmi-charts

2. **Business Layer**
   - Portfolio, market data, transaction, risk, user modules

3. **Data Access**
   - Data services (DAO, cache), state management

4. **External Services**
   - **Portfolio Analytics API**: FastAPI (DDD). REST: GET /api/v1/portfolio, POST /api/v1/seed. AI/ML: /api/v1/ai (risk/var, fraud/check, surveillance/trade, sentiment, identity/score, dl/forecast, llm/summarise, ollama/generate, huggingface/summarise, tf/forecast). PostgreSQL; Kafka (portfolio.events). Config: .env (.env.example). Tests: pytest (pnpm run test:api).
   - Vercel Analytics, market data API, storage, big data service layer (Java Spring Boot: SparkService, FlinkService, HadoopService)

**API surfaces**: Portfolio API (GET /portfolio, POST /seed); AI/ML API (VaR, fraud, surveillance, sentiment, identity, forecast, summarisation, Ollama, Hugging Face, TensorFlow); market, transaction, risk, Spark, Flink, Hadoop APIs.

#### Mobile Applications

- **apps/mobile-portfolio** uses **Portfolio Analytics API** (http://localhost:8800). Run `pnpm run start:backend` then `pnpm dev:mobile-portfolio`. Includes NativeDemoCard and six native charts with theme, tooltips, x-axis, drag-to-scroll.

### Data Architecture

**File**: `data-architecture.puml`

**Description**: Core data entities and relationships.

**Entities**: Portfolio, Asset, Transaction, Market Data, Watch List, Risk Metrics, User Preferences, User; Spark/Flink/Hadoop data entities.

**Relationships**: User ↔ Portfolio (1:n); Portfolio ↔ Asset (1:n); Portfolio ↔ Risk (1:1); User ↔ Transaction (1:n); Asset ↔ Market Data (1:n).

**Data flows**: Market → asset prices; Transactions → portfolio; Portfolio + market → risk metrics; **Portfolio Analytics**: portfolio → PostgreSQL (portfolio table); POST /seed writes; GET /portfolio reads; seed publishes portfolio.seeded to Kafka (portfolio.events).

### Technology Architecture

**File**: `technology-architecture.puml`

**Description**: Technology stack, build tools, and deployment.

**Stack**: Front-end (Angular, React Native, Expo, React 19, TypeScript 5); mobile native (iOS Metal, Android OpenGL ES; shared chart logic); UI (Radix UI, Tailwind, Lucide); visualization (Chart.js, ng2-charts, chartjs-chart-financial, react-native-wagmi-charts, native charts); utilities (React Hook Form, Zod, date-fns, themes); build (Angular/TS, Maven, Java, Spring Boot); deployment (Vercel, Git, Java JAR/containers, REST); **Portfolio Analytics Backend** (FastAPI, uvicorn, port 8800; PostgreSQL 5433, Kafka 9092; AI/ML: Ollama, Hugging Face, TensorFlow, scipy/statsmodels/sumy; python-dotenv, pytest); big data (Java 17+, Spring Boot 3.2, Maven, Spark 3.5, Flink 1.19, Hadoop 3.3).

**Standards**: Development (TypeScript, ESLint, componentization); performance; security (HTTPS, CSP, XSS, validation); accessibility (WCAG 2.1 AA).

### Architecture TODO Alignment

- High-level tasks in `docs/TODO.md`. When changing architecture, update: PlantUML (`*.puml`), this README, and `docs/TODO.md`.

### Finance System Domain Views

**Directory**: `docs/domain` (English). Chinese: `doc_zh/domain/`.

**Files**: `finance-system-architecture.puml` (includes AI and ML Services); `finance-system.puml` (channels, edge, core, data, external); `finance-system-domains.puml` (domains including AI/ML); `finance-system-flows.puml` (flows including DL forecast, LLM summarisation).

### AI and ML Integration

| Area        | Flow / Component | Role                                                                 |
|------------|-------------------|----------------------------------------------------------------------|
| Onboarding | KYC               | Document and identity AI                                             |
| Funding    | Payment            | Fraud and anomaly detection                                          |
| Trading    | Order / Post-trade | ML limits; AI post-trade surveillance                                |
| Risk & Reporting | Analytics      | ML VaR; DL forecast; NLP sentiment; LLM summarisation                |

Update PlantUML and **Artificial Intelligence & ML** in `docs/TODO.md` when adding or changing AI capabilities.

## How to View Diagrams

Diagrams are in **PlantUML** (`.puml`).

### Option 1: PlantUML CLI

```bash
npm install -g @plantuml/plantuml
# or: brew install plantuml

plantuml business-architecture.puml
plantuml application-architecture.puml
plantuml data-architecture.puml
plantuml technology-architecture.puml
plantuml -tsvg *.puml
```

### Option 2: Online

- [PlantUML online](http://www.plantuml.com/plantuml/uml/) — paste `.puml` content.

### Option 3: IDE

- VS Code: PlantUML extension (e.g. Alt+D to preview)
- IntelliJ: PlantUML integration

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

## Evolution

- Diagrams are under Git. Document significant changes in diagram comments. Review periodically against implementation.

## References

- [TOGAF 9.2](https://www.opengroup.org/togaf)
- [PlantUML](https://plantuml.com/)
- [Next.js](https://nextjs.org/docs) · [React](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/docs/)

## Architecture Decision Records

### ADR-001: Next.js as front-end framework

**Decision**: Next.js 16 as primary front-end. **Rationale**: SSR/SSG, routing, TypeScript, Vercel integration. **Impact**: Front-end built on Next.js.

### ADR-002: PlantUML for architecture diagrams

**Decision**: PlantUML for architecture. **Rationale**: Version-control friendly, multiple diagram types, widely used. **Impact**: All architecture docs use `.puml`.

### ADR-003: Hybrid architecture for big data

**Decision**: Java Spring Boot for native Spark/Flink/Hadoop integration. **Rationale**: Direct API access, REST for TS clients, separation of concerns. **Impact**: Optional TypeScript front-end + Java backend; REST for cross-language communication.

---

**Version**: 1.2.0  
**Last updated**: 2025  
**Maintained by**: FinPulse team
