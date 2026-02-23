# Portfolio API (Go)

API gateway and auth service. Same DB as `server-python` (Python). Port 8801 by default; proxies unimplemented routes to Python (8800). Single entry for the app.

## Endpoints

- `GET /health` – health check
- **Auth** (handled in Go): `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/change-password`
- `GET /api/v1/quotes?symbols=AAPL,MSFT` – real-time quotes from `realtime_quote`
- `GET /api/v1/instruments?limit=100&offset=0` – list instruments
- All other `/api/v1/*` – proxied to Python backend (e.g. portfolio, customers, payments, trades, risk-metrics)

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
Or: `./scripts/start.sh` (builds then runs). Set `DATABASE_URL` and `PORT` (default 8801) if needed; copy `.env.example` to `.env` optional.

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
