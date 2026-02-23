# Database Scripts

PostgreSQL schema and seed data for the fintech ER model (see [docs/er-diagram](../../docs/er-diagram/)).

## Prerequisites

- PostgreSQL 14+ (or use the project's Postgres via `docker-compose` in `apps/server-python/`).
- Create a database (e.g. `fintech`) if you want a dedicated DB; otherwise run against an existing DB such as `portfolio`.

## Create database (optional)

```bash
createdb -h localhost -p 5433 -U postgres fintech
```

Or with Docker:

```bash
docker exec -it <postgres_container> psql -U postgres -c "CREATE DATABASE fintech;"
```

## Run schema

```bash
psql -h localhost -p 5433 -U postgres -d fintech -f scripts/db/schema.sql
```

For the default `portfolio` database:

```bash
psql -h localhost -p 5433 -U postgres -d portfolio -f scripts/db/schema.sql
```

## Run seed data

After the schema is applied:

```bash
psql -h localhost -p 5433 -U postgres -d fintech -f scripts/db/seed.sql
```

## Run both (schema then seed)

From the project root:

```bash
./scripts/db/run.sh
```

Or with explicit connection options:

```bash
PGHOST=localhost PGPORT=5433 PGUSER=postgres PGDATABASE=fintech ./scripts/db/run.sh
```

## Tables created

- **Core:** customer, user_preference, account, portfolio  
- **Reference:** instrument, position, watchlist, watchlist_item  
- **Instrument extensions:** bond, option  
- **Trading:** orders, trade  
- **Payments:** cash_transaction, payment, settlement  
- **Market and risk:** market_data, technical_indicator, risk_metrics  
- **Analytics:** portfolio_optimization, statistical, valuation  

Note: `order` is created as `orders` and `transaction` as `cash_transaction` to avoid SQL reserved words.
