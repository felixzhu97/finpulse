# FinPulse Mobile App - C4 Architecture Diagrams

This directory contains C4 architecture diagrams for the FinPulse mobile application.

## Diagrams

| Level | File | Description |
|-------|------|-------------|
| Context | `c4-finpulse-mobile-context.puml` | System-level view showing the mobile app's interaction with external systems |
| Container | `c4-finpulse-mobile-containers.puml` | High-level container architecture of the mobile app |
| Component | `c4-finpulse-mobile-components.puml` | Detailed component architecture with hooks, store, and lib layers |

## Viewing Diagrams

These PlantUML diagrams can be viewed using:

1. **PlantUML Server**: Upload `.puml` files to [plantuml.com/plantuml](https://www.plantuml.com/plantuml)
2. **IDE Plugins**:
   - VS Code: PlantUML extension
   - IntelliJ: PlantUML Integration
3. **Command Line**: `plantuml diagram.puml`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   FinPulse Mobile App                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Screens │  │  Store   │  │  Hooks    │  │Components  │  │
│  │ (Expo)   │  │ (Redux)  │  │          │  │            │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│         │            │            │               │         │
│  ┌──────▼────────────▼────────────▼───────────────▼───────┐ │
│  │                      lib / Infrastructure               │ │
│  │  API Clients  │  WebSocket  │  Web3  │  Network     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌─────────────────┐
│ Portfolio API │ │ Quote WS      │ │ Ethereum Sepolia│
└───────────────┘ └───────────────┘ └─────────────────┘
```

## Layer Descriptions

### App Layer (`app/`)
- **Screens**: Expo Router pages for authentication and main tabs
- **Layouts**: Shared layout components for navigation structure

### Components Layer (`components/`)
- **Watchlist**: Stock watchlist management components
- **Portfolio**: Investment portfolio visualization components
- **Account**: Account management and trading components
- **Insights**: Risk metrics and analytics components
- **Blockchain**: Ethereum wallet integration components
- **Native**: High-performance native chart modules
- **UI**: Shared UI primitives (MetricCard, SortMenu, etc.)

### Hooks Layer (`hooks/`)
- **Auth**: Authentication and token management hooks
- **Portfolio**: Portfolio data fetching hooks
- **Market**: Market data and quote streaming hooks
- **Risk**: Risk metrics and VaR computation hooks
- **Account**: Account data and preferences hooks
- **Blockchain**: Web3 and wallet hooks

### Store Layer (`store/`)
- **authSlice**: User authentication state
- **quotesSlice**: Real-time stock quotes
- **portfolioSlice**: Portfolio data cache
- **preferencesSlice**: User preferences
- **web3Slice**: Ethereum wallet state

### Lib Layer (`lib/`)
- **api/**: REST API clients for all backend services
- **services/**: QuoteStreamService, Web3Service
- **network/**: HTTP client, auth bridge, configuration
