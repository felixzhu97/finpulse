# Portfolio API (Go)

API gateway and core services. Same DB as `server-python`. Port 8801 by default. Single API entry; CRUD for all core entities. Analytics (VaR, forecast, risk-metrics, valuations) proxied to Python.

## Endpoints (Go)

- `GET /health` – health check
- **Auth**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/change-password`
- **Quotes**: `GET /api/v1/quotes?symbols=AAPL,MSFT`
- **Blockchain**: `POST /api/v1/blockchain/seed-balance`, `GET /api/v1/blockchain/blocks`, `GET /api/v1/blockchain/blocks/:block_index`, `POST /api/v1/blockchain/transfers`, `GET /api/v1/blockchain/transactions/:tx_id`, `GET /api/v1/blockchain/balances`
- **CRUD** (list, get, create, batch, update, delete): customers, accounts, user-preferences, instruments, bonds, options, portfolios, positions, watchlists, watchlist-items, orders, trades, cash-transactions, payments, settlements, market-data

## Proxied to Python

- `/api/v1/risk-metrics/*`, `/api/v1/analytics/*`, `/api/v1/forecast/*`, `/api/v1/valuations/*` – analytics (VaR, forecast, ClickHouse, MLflow)

## Swagger

`http://localhost:8801/swagger/index.html` (edit `docs/swagger.json` to change)

## Run

**1. One-time: install deps** (needs network; if timeout, try another network or VPN)
```bash
cd apps/server-go
GOPROXY=https://goproxy.cn,direct go mod tidy
# or: GOPROXY=https://proxy.golang.org,direct go mod tidy
```

**2. Start Postgres** (same as server-python; from repo root: `pnpm run start:server` or start Docker for postgres only).

**3. Start API**
```bash
cd apps/server-go
go run ./cmd/server
```
Or: `./scripts/start.sh` (builds then runs). Set `DATABASE_URL`, `REDIS_URL` (optional, for blockchain cache), `PORT` (default 8801), `PYTHON_BACKEND_URL`; copy `.env.example` to `.env` optional.

## Build

```bash
go build -o bin/server ./cmd/server
./bin/server
```

If `go mod tidy` or `go build` times out (e.g. proxy.golang.org unreachable), use a mirror:

```bash
GOPROXY=https://goproxy.cn,direct go mod tidy
go build -o bin/server ./cmd/server
```

Or run `make deps` then `make build`.
