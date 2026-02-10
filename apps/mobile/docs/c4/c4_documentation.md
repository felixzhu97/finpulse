# Mobile Portfolio App - C4 Model

C4 architecture model for the FinPulse Mobile Portfolio app (Expo + React Native).

## 1. System Context

![System Context](./diagrams/system_context.puml)

**Elements**:
- **Investor**: Portfolio and market analysis user
- **Mobile Portfolio**: Expo + React Native portfolio app
- **Portfolio Analytics API**: Backend REST and WebSocket API

## 2. Container Diagram

![Containers](./diagrams/containers.puml)

**Stack**:
- **React Native App**: Expo + RN, Stocks, accounts, insights, profile
- **Portfolio Service**: TypeScript API client
- **Quote Socket**: WebSocket real-time quotes
- **Portfolio Analytics API**: FastAPI backend

## 3. Component Diagram

![Components](./diagrams/components.puml)

**Components**:
- **Stocks Screen**: Stock list with NativeSparkline, useRealtimeQuotes, usePerSymbolHistory
- **Accounts Screen**: Account overview
- **Insights Screen**: Portfolio insights
- **Profile Screen**: User profile
- **Portfolio Store**: Zustand global state

## Platform-Level C4

Project-wide C4 diagrams are in `docs/en/c4/`:
- `c4-system-context.puml` — FinPulse platform context
- `c4-containers.puml` — Platform containers (Web, Mobile, API, DB)
- `c4-components.puml` — Portfolio Analytics API components
- `c4-web-app-components.puml` — Web app components

## How to View

1. Install PlantUML extension in VSCode
2. Open `.puml` files to preview
3. Or use online viewer: https://www.plantuml.com/plantuml/uml/
