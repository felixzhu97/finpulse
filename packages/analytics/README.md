# @fintech/analytics

Shared behavior analytics and A/B testing for FinPulse apps (Portal, Admin, Mobile).

## Usage

- **React**: `AnalyticsProvider` (transport), `useAnalytics()` → `track(name, properties)`, `identify(userId, traits)`. Export from `@fintech/analytics/react`.
- **Transports**: `createConsoleTransport()`, `createHttpTransport(baseUrl, source)` — events sent to `POST {baseUrl}/analytics/events`.
- **Events**: Constants in `@fintech/analytics` (e.g. `PAGE_VIEW`, `LOGIN`, `ORDER_CREATE`, `SCREEN_VIEW`). Backend: `GET /api/v1/analytics/events` for listing (Admin Behavior page).

## A/B (GrowthBook)

`createGrowthBook(config)`, `GrowthBookProvider`, `useFeatureIsOn`, `useFeatureValue` from `@fintech/analytics/react`.
