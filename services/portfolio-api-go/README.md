# Portfolio API (Go)

Non-AI backend service. Same DB as `portfolio-analytics` (Python). Use port 8801 by default so both can run next to each other.

## Endpoints

- `GET /health` – health check
- `GET /api/v1/quotes?symbols=AAPL,MSFT` – real-time quotes from `realtime_quote`
- `GET /api/v1/instruments?limit=100&offset=0` – list instruments

## Swagger

`http://localhost:8801/swagger/index.html` (edit `docs/swagger.json` to change)

## Run

**1. One-time: install deps** (needs network; if timeout, try another network or VPN)
```bash
cd services/portfolio-api-go
GOPROXY=https://goproxy.cn,direct go mod tidy
# or: GOPROXY=https://proxy.golang.org,direct go mod tidy
```

**2. Start Postgres** (same as portfolio-analytics; from repo root: `pnpm run start:backend` or start Docker for postgres only).

**3. Start API**
```bash
cd services/portfolio-api-go
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
