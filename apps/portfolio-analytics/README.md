## Portfolio Analytics (Python FastAPI)

Backend service providing portfolio analytics for the mobile and web clients. It uses **TimescaleDB** (PostgreSQL extension) for time-series portfolio history, **Redis** for caching, **PostgreSQL** for portfolio metadata, and **Kafka** for messaging. The codebase follows **Clean Architecture**: domain at the centre, application use cases and ports, infrastructure implementing ports, and API as the composition root.

### Clean Architecture (layers)

```
                    ┌─────────────────────────────────────────┐
                    │              API (src/api/)               │
                    │  dependencies.py, v1/endpoints, schemas, │
                    │  mappers; composition root only imports  │
                    │  infrastructure here                     │
                    └───────────────────┬─────────────────────┘
                                        │
    ┌───────────────────────────────────┼───────────────────────────────────┐
    │           Infrastructure (src/infrastructure/)                          │
    │  database/, cache/ (Redis), config/, external_services/,                │
    │  message_brokers/; implements application ports                        │
    └───────────────────────────────────┬───────────────────────────────────┘
                                        │
    ┌───────────────────────────────────┼───────────────────────────────────┐
    │         Application (src/core/application/)                            │
    │  use_cases/, ports/ (repositories, services, message_brokers)          │
    │  Depends only on domain and ports                                       │
    └───────────────────────────────────┬───────────────────────────────────┘
                                        │
    ┌───────────────────────────────────┼───────────────────────────────────┐
    │             Domain (src/core/domain/)                                   │
    │  entities/, value_objects/, events/, exceptions/, services/            │
    │  No outer-layer dependencies                                           │
    └────────────────────────────────────────────────────────────────────────┘
```

- **Domain** (`src/core/domain/`): Entities, value objects, domain services, events, exceptions. No framework or outer-layer dependencies.
- **Application** (`src/core/application/`): Use cases and ports (repository, service, message-broker interfaces). Depends only on domain.
- **Infrastructure** (`src/infrastructure/`): Database (ORM, repositories, session), **cache** (Redis via `cache/redis_cache.py`), external services (analytics, market data), message brokers (Kafka). Implements application ports.
- **API** (`src/api/`): HTTP endpoints, schemas, mappers, and dependency injection. Composition root: `composition.py` (lifespan), `dependencies.py` (per-request wiring), `crud_helpers.py` (generic CRUD routes). Entrypoint is `main.py`. Lifespan creates engine, session factory, Redis, quote repo, Kafka consumers; `get_session` uses `request.app.state.session_factory` so DB work runs on the same event loop. `get_realtime_quote_repo` accepts both `Request` and `WebSocket` for WebSocket routes.

### Infrastructure (runtime)

Start core services (TimescaleDB, Redis, Kafka) or the full stack including MinIO, ClickHouse, Airflow, MLflow (from this directory):

```bash
docker compose up -d
```

For core-only: `docker compose up -d postgres redis zookeeper kafka`.

Default connection:

- **TimescaleDB (PostgreSQL):** `postgresql://postgres:postgres@127.0.0.1:5433/portfolio` – portfolio metadata in JSONB; portfolio history in hypertable `portfolio_history`
- **Redis:** `redis://127.0.0.1:6379/0` – server-side cache (shared client in app lifespan). Used for: portfolio history range (`portfolio:history:{id}:{days}d`, TTL from `HISTORY_CACHE_TTL_SECONDS`), portfolio aggregate response (`portfolio:aggregate:demo-portfolio`, 300s), and blockchain read responses (blocks list, block+transactions, transaction by id, balance; prefix `blockchain:*`, 300s). Writes (seed, transfer, seed-balance) invalidate the relevant cache keys so reads stay consistent.
- **Kafka:** `localhost:9092`. Topics:
  - `portfolio.events` – portfolio seed events (created on first produce)
  - `market.quotes.enriched` – enriched real-time market quotes (symbol-keyed, produced by external provider or Flink jobs)

Override with env: `DATABASE_URL`, `REDIS_URL`, `HISTORY_CACHE_TTL_SECONDS`, `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_PORTFOLIO_TOPIC`. An example config is in `.env.example` (copy to `.env` and source it, or set vars in your shell).

### Run the API

**All commands must be run from the project root** (`finpulse`), not from `docs/` or other subdirs.

**Option A – One command (from project root):**

```bash
pnpm run start:backend
```

This starts Docker (Postgres, Redis, Kafka), creates/uses `.venv` in `apps/portfolio-analytics`, runs migrations, and starts the API on port 8800.

**Option B – Step by step (from project root):**

```bash
cd apps/portfolio-analytics
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/portfolio
export KAFKA_BOOTSTRAP_SERVERS=127.0.0.1:9092

# Start DB/Kafka first (from project root: docker compose -f apps/portfolio-analytics/docker-compose.yml up -d)
.venv/bin/alembic upgrade head
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8800 --reload
```

Use `.venv/bin/alembic` and `.venv/bin/uvicorn` so the project’s virtualenv is used; otherwise `alembic`/`uvicorn` may not be found. Run from `apps/portfolio-analytics` so `main` and `src` are on the Python path.

### Alembic

Schema and migrations are managed by Alembic. Config: `alembic.ini`. Migrations: `alembic/versions/`.

```bash
alembic upgrade head    # Apply migrations
alembic revision -m "..."  # Create new migration
alembic downgrade -1    # Rollback one revision
alembic current        # Show current revision
```

### API

**Portfolio and real-time**

- `GET /api/v1/portfolio` – returns the portfolio from PostgreSQL (or in-memory demo if DB is empty). Response is cached in Redis (key `portfolio:aggregate:demo-portfolio`, TTL 300s); cache is invalidated on `POST /api/v1/seed`.
- `POST /api/v1/seed` – accepts a portfolio JSON body, stores it in PostgreSQL, invalidates portfolio aggregate cache, and publishes a `portfolio.seeded` event to Kafka.
- `GET /api/v1/quotes?symbols=...` – returns the latest real-time quotes; read-through Redis cache, fallback to `realtime_quote` table.
- `GET /api/v1/quotes/history?symbols=...&minutes=5` – returns historical price series from `quote_tick` (or `quote_ohlc_1min` fallback); powered by `QuoteHistoryService`.
- `WebSocket /ws/quotes` – accepts `{"type":"subscribe","symbols":["AAPL","MSFT"]}` or `"update"` messages and pushes `{"type":"snapshot","quotes":{...}}` snapshots using the same quote structure as the HTTP endpoint.

**REST resources** (under `/api/v1/`): customers, user-preferences, accounts, instruments, portfolios, positions, watchlists, watchlist-items, bonds, options, orders, trades, cash-transactions, payments, settlements, market-data, risk-metrics, valuations. Each resource has list, get-by-id, create, update, delete. **Batch create**: for each resource, `POST /api/v1/<resource>/batch` accepts a JSON array of create payloads and returns an array of created entities (e.g. `POST /api/v1/customers/batch`, `POST /api/v1/instruments/batch`). The seed script (`scripts/seed/generate-seed-data.js`) uses these batch endpoints to minimise the number of HTTP calls during seeding.

**Blockchain simulation** (under `/api/v1/blockchain/`): in-app chain (blocks + chain transactions + wallet balances). Endpoints: `GET /blockchain/blocks` (list blocks), `GET /blockchain/blocks/{block_index}` (block with transactions), `POST /blockchain/transfers` (submit transfer; body: sender_account_id, receiver_account_id, amount, currency), `GET /blockchain/transactions/{tx_id}`, `GET /blockchain/balances?account_id=...&currency=SIM_COIN`. Read responses are cached in Redis (prefix `blockchain:*`, TTL 300s); `POST /blockchain/seed-balance` and `POST /blockchain/transfers` invalidate the relevant cache. Default currency `SIM_COIN`; balances are per account and can be shown as an asset type in portfolio views. See `docs/en/product/domain/blockchain-simulation.md`.

### AI, ML and DL (integrated into business flows)

LLM, ML and DL are integrated into business operations rather than exposed as standalone endpoints:

| Business flow | AI/ML integration |
|---------------|-------------------|
| **Payments** | `POST /payments` enriches response with `fraud_recommendation` (allow/review/block) and `fraud_score` via scikit-learn Isolation Forest. |
| **Trades** | `POST /trades` enriches response with `surveillance_alert` and `surveillance_score` via NumPy z-score anomaly detection. |
| **Customers** | `POST /customers` enriches response with `ai_identity_score` via rule-based document/identity scoring. |
| **Risk metrics** | `POST /risk-metrics/compute` computes VaR from portfolio history using SciPy (parametric) or NumPy (historical). |

Libraries used: **SciPy** (parametric VaR), **NumPy** (historical VaR, surveillance), **scikit-learn** (fraud detection), **statsmodels** (forecast), **VADER** (sentiment), **sumy/nltk** (summarisation). Optional: **Ollama**, **Hugging Face** via `AnalyticsApplicationService`; **PyTorch** and **MLflow** for model training and inference.

### Testing

- **Pytest** – from repo root: `pnpm run test` or `pnpm run test:api` (runs `pytest tests -v` in `apps/portfolio-analytics`). Tests are under `tests/api/` by feature (accounts, blockchain, portfolio, trading, payments, etc.). **Async DB tests** use `httpx.AsyncClient` with `ASGITransport` and the app’s lifespan context (`blockchain_client` fixture in `conftest.py`) so the app and tests share the same event loop; session/engine are created in lifespan and bound to that loop. Unit tests live in `tests/unit/`. See `tests/README.md` for layout and concurrency testing notes.
### Messaging

- **Portfolio events**

  On seed, the service produces a message to `portfolio.events` with payload:

  - `type`: `portfolio.seeded`
  - `portfolio_id`: portfolio id
  - `payload`: full portfolio JSON

  Consumers can subscribe to this topic for analytics or downstream processing.

- **Real-time market data**

  - `MockQuoteWriter` produces to Kafka; `KafkaQuoteConsumer` sinks to `realtime_quote` and `quote_tick`. Fallback: direct DB write when Kafka unavailable.
  - TimescaleDB: `quote_ohlc_1min`, `quote_ohlc_5min` continuous aggregates; compression for chunks older than 7 days.
  - `CachedMarketDataProvider` uses Redis read-through and write-through; `MarketDataService` powers `GET /api/v1/quotes` and `WebSocket /ws/quotes`.
  - `RealtimeQuoteRepository` uses ORM (`RealtimeQuoteRow`, `QuoteTickRow`), bulk upsert and bulk insert for `realtime_quote` and `quote_tick`; `QuoteHistoryService` use case for history via `IRealtimeQuoteRepository`.

### Big data and ML stack

The service integrates a Python-centric big data stack alongside the core API. All components are optional and started via `docker compose up -d` from this directory.

| Component | Purpose | Port / URL |
|-----------|---------|------------|
| **MinIO** | S3-compatible object storage (data lake) | 9000 (API), 9001 (console) |
| **Delta Lake** | ACID table format on object storage; used by PySpark jobs | Via Spark / MinIO paths |
| **ClickHouse** | OLAP analytics store for batch/stream results | 8123 (HTTP), 9009 (native) |
| **PySpark** | Batch processing (e.g. batch VaR, Delta writes) | N/A (job process) |
| **Faust** | Lightweight stream processing (Kafka consumers) | N/A (worker process) |
| **Airflow** | DAG orchestration for batch and ML jobs | 8080 (webserver) |
| **MLflow** | Experiment tracking and model registry | 5001 |

- **Batch VaR**: `POST /api/v1/risk-metrics/compute-batch` accepts `portfolio_ids`, `days`, `confidence`, `method` and returns VaR per portfolio. Standalone job: `python -m jobs.batch.var_batch [--input path.json] [--delta-path ...]` (writes to ClickHouse and optionally Delta).
- **Delta read**: Run `python -m jobs.batch.delta_sync_info` to sync Delta table stats to ClickHouse; then `GET /api/v1/analytics/delta-info?path=...` returns row count and sample.
- **Stream**: Run Faust with `faust -A src.infrastructure.stream.faust_app worker -l info` (consumes `market.quotes.enriched`, `portfolio.events`). Set `STREAM_WRITE_TO_MINIO=1` to write batches to MinIO via `S3ObjectStorageClient`.
- **ML**: `python -m jobs.ml.train_sample` logs a sample PyTorch model to MLflow. `POST /api/v1/forecast/model` with `{"model_uri": "runs:/...", "values": [...]}` loads a model via MLflow and returns predictions. `GET /api/v1/analytics/portfolio-risk` and `GET /api/v1/analytics/delta-info` read from ClickHouse.
- **Runbook**: See `docs/runbook.md` in this directory for startup order and troubleshooting.
