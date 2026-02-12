# Portfolio Analytics API

Base: `/api/v1` for resources; app routes use full path. Query params: `limit`, `offset` where applicable.

## App

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/portfolio` | Aggregated portfolio |
| GET | `/api/v1/quotes` | Quotes; query `symbols` (comma-separated) |
| POST | `/api/v1/seed` | Seed portfolio; body: portfolio payload |
| WS | `/ws/quotes` | WebSocket; send `{ "type": "subscribe", "symbols": ["AAPL"] }` |

## Accounts

| Method | Path |
|--------|------|
| GET | `/api/v1/accounts` |
| GET | `/api/v1/accounts/{account_id}` |
| POST | `/api/v1/accounts` |
| POST | `/api/v1/accounts/batch` |
| PUT | `/api/v1/accounts/{account_id}` |
| DELETE | `/api/v1/accounts/{account_id}` |

## Customers

| Method | Path |
|--------|------|
| GET | `/api/v1/customers` |
| GET | `/api/v1/customers/{customer_id}` |
| POST | `/api/v1/customers` |
| POST | `/api/v1/customers/batch` |
| PUT | `/api/v1/customers/{customer_id}` |
| DELETE | `/api/v1/customers/{customer_id}` |

## User preferences

| Method | Path |
|--------|------|
| GET | `/api/v1/user-preferences` |
| GET | `/api/v1/user-preferences/{preference_id}` |
| POST | `/api/v1/user-preferences` |
| POST | `/api/v1/user-preferences/batch` |
| PUT | `/api/v1/user-preferences/{preference_id}` |
| DELETE | `/api/v1/user-preferences/{preference_id}` |

## Instruments

| Method | Path |
|--------|------|
| GET | `/api/v1/instruments` |
| GET | `/api/v1/instruments/{instrument_id}` |
| POST | `/api/v1/instruments` |
| POST | `/api/v1/instruments/batch` |
| PUT | `/api/v1/instruments/{instrument_id}` |
| DELETE | `/api/v1/instruments/{instrument_id}` |

## Bonds

| Method | Path |
|--------|------|
| GET | `/api/v1/bonds` |
| GET | `/api/v1/bonds/{bond_id}` |
| POST | `/api/v1/bonds` |
| POST | `/api/v1/bonds/batch` |
| PUT | `/api/v1/bonds/{bond_id}` |
| DELETE | `/api/v1/bonds/{bond_id}` |

## Options

| Method | Path |
|--------|------|
| GET | `/api/v1/options` |
| GET | `/api/v1/options/{option_id}` |
| POST | `/api/v1/options` |
| POST | `/api/v1/options/batch` |
| PUT | `/api/v1/options/{option_id}` |
| DELETE | `/api/v1/options/{option_id}` |

## Portfolios

| Method | Path |
|--------|------|
| GET | `/api/v1/portfolios` |
| GET | `/api/v1/portfolios/{portfolio_id}` |
| POST | `/api/v1/portfolios` |
| POST | `/api/v1/portfolios/batch` |
| PUT | `/api/v1/portfolios/{portfolio_id}` |
| DELETE | `/api/v1/portfolios/{portfolio_id}` |

## Positions

| Method | Path |
|--------|------|
| GET | `/api/v1/positions` |
| GET | `/api/v1/positions/{position_id}` |
| POST | `/api/v1/positions` |
| POST | `/api/v1/positions/batch` |
| PUT | `/api/v1/positions/{position_id}` |
| DELETE | `/api/v1/positions/{position_id}` |

## Watchlists

| Method | Path |
|--------|------|
| GET | `/api/v1/watchlists` |
| GET | `/api/v1/watchlists/{watchlist_id}` |
| POST | `/api/v1/watchlists` |
| POST | `/api/v1/watchlists/batch` |
| PUT | `/api/v1/watchlists/{watchlist_id}` |
| DELETE | `/api/v1/watchlists/{watchlist_id}` |

## Watchlist items

| Method | Path |
|--------|------|
| GET | `/api/v1/watchlist-items` |
| GET | `/api/v1/watchlist-items/{watchlist_item_id}` |
| POST | `/api/v1/watchlist-items` |
| POST | `/api/v1/watchlist-items/batch` |
| PUT | `/api/v1/watchlist-items/{watchlist_item_id}` |
| DELETE | `/api/v1/watchlist-items/{watchlist_item_id}` |

## Orders

| Method | Path |
|--------|------|
| GET | `/api/v1/orders` |
| GET | `/api/v1/orders/{order_id}` |
| POST | `/api/v1/orders` |
| POST | `/api/v1/orders/batch` |
| PUT | `/api/v1/orders/{order_id}` |
| DELETE | `/api/v1/orders/{order_id}` |

## Trades

| Method | Path |
|--------|------|
| GET | `/api/v1/trades` |
| GET | `/api/v1/trades/{trade_id}` |
| POST | `/api/v1/trades` |
| POST | `/api/v1/trades/batch` |
| PUT | `/api/v1/trades/{trade_id}` |
| DELETE | `/api/v1/trades/{trade_id}` |

## Cash transactions

| Method | Path |
|--------|------|
| GET | `/api/v1/cash-transactions` |
| GET | `/api/v1/cash-transactions/{transaction_id}` |
| POST | `/api/v1/cash-transactions` |
| POST | `/api/v1/cash-transactions/batch` |
| PUT | `/api/v1/cash-transactions/{transaction_id}` |
| DELETE | `/api/v1/cash-transactions/{transaction_id}` |

## Payments

| Method | Path |
|--------|------|
| GET | `/api/v1/payments` |
| GET | `/api/v1/payments/{payment_id}` |
| POST | `/api/v1/payments` |
| POST | `/api/v1/payments/batch` |
| PUT | `/api/v1/payments/{payment_id}` |
| DELETE | `/api/v1/payments/{payment_id}` |

## Settlements

| Method | Path |
|--------|------|
| GET | `/api/v1/settlements` |
| GET | `/api/v1/settlements/{settlement_id}` |
| POST | `/api/v1/settlements` |
| POST | `/api/v1/settlements/batch` |
| PUT | `/api/v1/settlements/{settlement_id}` |
| DELETE | `/api/v1/settlements/{settlement_id}` |

## Market data

| Method | Path |
|--------|------|
| GET | `/api/v1/market-data` |
| GET | `/api/v1/market-data/{data_id}` |
| POST | `/api/v1/market-data` |
| POST | `/api/v1/market-data/batch` |
| PUT | `/api/v1/market-data/{data_id}` |
| DELETE | `/api/v1/market-data/{data_id}` |

## Risk metrics

| Method | Path |
|--------|------|
| GET | `/api/v1/risk-metrics` |
| GET | `/api/v1/risk-metrics/{metric_id}` |
| POST | `/api/v1/risk-metrics` |
| POST | `/api/v1/risk-metrics/batch` |
| POST | `/api/v1/risk-metrics/compute` | Compute VaR from portfolio history; body: `{ portfolio_id, confidence?, method? }` |
| POST | `/api/v1/risk-metrics/compute-batch` | Batch VaR for multiple portfolios; body: `{ portfolio_ids, days?, confidence?, method? }`. Writes to ClickHouse; used by Airflow DAG. |
| PUT | `/api/v1/risk-metrics/{metric_id}` |
| DELETE | `/api/v1/risk-metrics/{metric_id}` |

## Analytics (ClickHouse)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/portfolio-risk` | Portfolio risk series from ClickHouse. Query: `portfolio_id` (optional), `limit` (default 100). Returns `{ "data": [...] }`. |
| GET | `/api/v1/analytics/delta-info` | Delta table stats (row count, sample) from ClickHouse. Query: `path` (optional; else `DELTA_SAMPLE_PATH`). Run `python -m jobs.batch.delta_sync_info` to populate. |

## Forecast (MLflow)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/forecast/model` | Load model from MLflow and predict. Body: `{ "model_uri": "runs:/<run_id>/model", "values": [ ... ] }`. Returns `{ "forecast": [...], "model_uri": "..." }`. |

## Valuations

| Method | Path |
|--------|------|
| GET | `/api/v1/valuations` |
| GET | `/api/v1/valuations/{valuation_id}` |
| POST | `/api/v1/valuations` |
| POST | `/api/v1/valuations/batch` |
| PUT | `/api/v1/valuations/{valuation_id}` |
| DELETE | `/api/v1/valuations/{valuation_id}` |

## AI/ML integration (in business flows)

AI, ML and DL are integrated into business operations:

- **Payments** (`POST /payments`): response includes `fraud_recommendation`, `fraud_score`.
- **Trades** (`POST /trades`): response includes `surveillance_alert`, `surveillance_score`.
- **Customers** (`POST /customers`): response includes `ai_identity_score`.
- **Risk** (`POST /risk-metrics/compute`): single-portfolio VaR from history. **Batch** (`POST /risk-metrics/compute-batch`): VaR for multiple portfolios; writes to ClickHouse.
- **Analytics**: `GET /analytics/portfolio-risk` (ClickHouse), `GET /analytics/delta-info` (Delta stats from ClickHouse).
- **Forecast**: `POST /forecast/model` loads an MLflow-registered model and returns predictions.

Schemas: see OpenAPI at `/docs`.
