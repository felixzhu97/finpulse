## Portfolio Analytics (Python FastAPI)

Backend service providing portfolio analytics for the mobile and web clients. It uses **PostgreSQL** for persistence and **Kafka** for messaging (portfolio events). The codebase is structured using **Domain-Driven Design (DDD)**.

### DDD layout

- **Domain** (`app/domain/`): **Portfolio** – entities (Portfolio, Account, Holding), value objects (PortfolioSummary, HistoryPoint), repository interface `IPortfolioRepository`. **Analytics** – value objects for results, domain services for business rules (e.g. `fraud_recommendation`, `surveillance_alert_type`, `identity_kyc_tier`, `var_interpretation`).
- **Application** (`app/application/`): **PortfolioApplicationService** – get/seed portfolio; **AnalyticsApplicationService** – VaR, fraud, surveillance, sentiment, identity, forecast, summarisation, Ollama, Hugging Face, TensorFlow. Application services orchestrate domain and infrastructure.
- **Infrastructure** (`app/infrastructure/`): **Persistence** – `PortfolioRepository` (implements `IPortfolioRepository` via `app.db`). **Messaging** – `EventPublisher` (Kafka). **Analytics** – providers (RiskVarProvider, FraudDetectorProvider, SurveillanceProvider, SentimentProvider, IdentityProvider, ForecastProvider, SummarisationProvider) and clients (Ollama, Hugging Face, TensorFlow).
- **API** (`app/api/`): HTTP handlers and DTOs; depend on application services only. Composition root: `app/container.py` builds repository, publisher, and application services.

### Infrastructure (runtime)

Start PostgreSQL and Kafka locally (from this directory):

```bash
docker compose up -d
```

Default connection:

- **PostgreSQL:** `postgresql://postgres:postgres@127.0.0.1:5433/portfolio` (host port 5433 to avoid conflict with a local Postgres on 5432)
- **Kafka:** `localhost:9092`. Topic: `portfolio.events` (created on first produce).

Override with env: `DATABASE_URL`, `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_PORTFOLIO_TOPIC`. An example config is in `.env.example` (copy to `.env` and source it, or set vars in your shell).

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

Endpoints are aligned with core finance flows: **Onboarding/KYC** (identity), **Funding** (fraud check), **Trading** (surveillance), **Risk & Reporting** (VaR, forecast, sentiment, summarisation). Requests support optional business context (e.g. `portfolio_id`, `instrument_id`, `transaction_type`, `report_type`). Responses include actionable fields where relevant: VaR `interpretation`, fraud `recommendation` (allow/review/block), surveillance `alert_type`, identity `kyc_tier`.

The server exposes an AI/ML layer under `/api/v1/ai` using:

- **SciPy**: parametric VaR (norm.ppf).
- **NumPy**: historical VaR, surveillance z-scores.
- **scikit-learn**: fraud and anomaly detection (Isolation Forest).
- **statsmodels**: time-series forecast (SimpleExpSmoothing).
- **VADER (vaderSentiment)**: English text sentiment.
- **sumy** and **nltk**: extractive text summarisation (LexRank).
- **Ollama**: local LLM (httpx client to `OLLAMA_BASE_URL`); env: `OLLAMA_BASE_URL`, `OLLAMA_DEFAULT_MODEL`.
- **Hugging Face** (transformers): summarisation pipeline; env: `HF_SUMMARISATION_MODEL`.
- **TensorFlow**: LSTM-based time-series forecast.

| Endpoint | Purpose |
|----------|--------|
| `POST /api/v1/ai/risk/var` | VaR (historical or parametric); body: returns, confidence, method. |
| `POST /api/v1/ai/fraud/check` | Fraud/anomaly score; body: amount, amount_currency, hour_of_day, day_of_week, recent_count_24h, optional reference_samples. |
| `POST /api/v1/ai/surveillance/trade` | Trade anomaly (z-score vs recent); body: quantity, notional, side, recent_quantities, recent_notionals. |
| `POST /api/v1/ai/sentiment` | Sentiment (VADER); body: text. |
| `POST /api/v1/ai/identity/score` | Identity/document score (rule-based); body: document_type, name_on_document, date_of_birth, id_number. |
| `POST /api/v1/ai/dl/forecast` | Time-series forecast (statsmodels SimpleExpSmoothing); body: values, horizon. |
| `POST /api/v1/ai/llm/summarise` | Extractive summarisation (sumy LexRank); body: text, max_sentences. |
| `POST /api/v1/ai/ollama/generate` | Ollama text generation; body: prompt, optional model. Requires Ollama running (see **Configuring Ollama** below). |
| `POST /api/v1/ai/huggingface/summarise` | Hugging Face summarisation; body: text, max_length, min_length. |
| `POST /api/v1/ai/tf/forecast` | TensorFlow LSTM forecast; body: values, horizon, lookback. |

**Testing**

- **Pytest (no server needed)** – from repo root: `pnpm run test:api`. Runs `tests/test_api_ai.py` and `tests/test_api_portfolio.py` via FastAPI `TestClient` (risk/var, fraud, surveillance, sentiment, identity, dl/forecast, llm/summarise, portfolio get/seed). Ollama/HuggingFace/TF tests pass with 200 and skip if the backend returns an error.
- **With API running** – `pnpm run generate-ai-seed-data` POSTs sample payloads to all AI endpoints; `pnpm run test:ai-api` runs `scripts/test-ai-api.sh` (curl) for a quick smoke test.

To only write payloads to `scripts/seed/ai-seed-data.json`, run `pnpm run generate-ai-seed-data:output`.

### Configuring Ollama

The `/api/v1/ai/ollama/generate` endpoint calls a local Ollama server. To use it:

1. **Install Ollama** – [ollama.com](https://ollama.com) or `brew install ollama` (macOS).
2. **Start Ollama** – run `ollama serve` (or start the Ollama app); it listens on `http://127.0.0.1:11434` by default.
3. **Pull a model** – e.g. `ollama run llama2` (this pulls and runs the model; keep the process running or run in background).
4. **Optional env** – set `OLLAMA_BASE_URL` if Ollama is on another host/port, and `OLLAMA_DEFAULT_MODEL` to use a different default model (e.g. `llama3.2`, `mistral`).

After Ollama is running with at least one model loaded, the API and `test_ollama_generate_returns_200` test will call it successfully.

### Hugging Face summarisation

The `/api/v1/ai/huggingface/summarise` endpoint uses the `transformers` pipeline (env: `HF_SUMMARISATION_MODEL`, default `sshleifer/distilbart-cnn-12-6`). It often fails when:

- **First run**: the model is downloaded from Hugging Face; ensure network access and enough disk space.
- **Low memory**: loading the model can use several GB RAM; on small machines or CI you may see OOM.
- **Proxy/firewall**: downloads from `huggingface.co` can fail if blocked.

If the test skips, it now prints the backend error (e.g. connection error, OOM). You can set `HF_SUMMARISATION_MODEL` to a smaller model or skip the HF test in CI. **First run** can take 1–3 minutes while the model is downloaded and loaded; the test has a 3-minute timeout.

### Messaging

On seed, the service produces a message to `portfolio.events` with payload:

- `type`: `portfolio.seeded`
- `portfolio_id`: portfolio id
- `payload`: full portfolio JSON

Consumers can subscribe to this topic for analytics or downstream processing.
