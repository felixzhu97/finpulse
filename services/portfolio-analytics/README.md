## Portfolio Analytics (Python FastAPI)

Backend service providing portfolio analytics for the mobile and web clients. It uses **PostgreSQL** for persistence and **Kafka** for messaging (portfolio events).

### Infrastructure

Start PostgreSQL and Kafka locally (from this directory):

```bash
docker compose up -d
```

Default connection:

- **PostgreSQL:** `postgresql://postgres:postgres@127.0.0.1:5433/portfolio` (host port 5433 to avoid conflict with a local Postgres on 5432)
- **Kafka:** `localhost:9092`. Topic: `portfolio.events` (created on first produce).

Override with env: `DATABASE_URL`, `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_PORTFOLIO_TOPIC`.

### Run the API

```bash
cd services/portfolio-analytics
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/portfolio
export KAFKA_BOOTSTRAP_SERVERS=127.0.0.1:9092

uvicorn app.main:app --host 0.0.0.0 --port 8800 --reload
```

From repo root: `pnpm dev:api` (ensure Postgres and Kafka are up and env is set if needed).

### API

- `GET /api/v1/portfolio` – returns the portfolio from PostgreSQL (or in-memory demo if DB is empty).
- `POST /api/v1/seed` – accepts a portfolio JSON body, stores it in PostgreSQL, and publishes a `portfolio.seeded` event to Kafka.

### AI and ML (framework and endpoints)

The server exposes an AI/ML layer under `/api/v1/ai` using:

- **NumPy**: risk (VaR) and surveillance (z-score) calculations.
- **scikit-learn**: fraud and anomaly detection (Isolation Forest).
- **VADER (vaderSentiment)**: English text sentiment for news/social content.

| Endpoint | Purpose |
|----------|--------|
| `POST /api/v1/ai/risk/var` | VaR (historical or parametric); body: returns, confidence, method. |
| `POST /api/v1/ai/fraud/check` | Fraud/anomaly score; body: amount, amount_currency, hour_of_day, day_of_week, recent_count_24h, optional reference_samples. |
| `POST /api/v1/ai/surveillance/trade` | Trade anomaly (z-score vs recent); body: quantity, notional, side, recent_quantities, recent_notionals. |
| `POST /api/v1/ai/sentiment` | Sentiment (VADER); body: text. |
| `POST /api/v1/ai/identity/score` | Identity/document score (rule-based); body: document_type, name_on_document, date_of_birth, id_number. |

To generate and send sample payloads for all AI endpoints (with the API running): from repo root run `pnpm run generate-ai-seed-data`. To write payloads to `scripts/ai-seed-data.json` only, run `pnpm run generate-ai-seed-data:output`.

### Messaging

On seed, the service produces a message to `portfolio.events` with payload:

- `type`: `portfolio.seeded`
- `portfolio_id`: portfolio id
- `payload`: full portfolio JSON

Consumers can subscribe to this topic for analytics or downstream processing.
