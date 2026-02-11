# API Tests

## Layout

```
tests/
  conftest.py             # Fixtures: client, blockchain_client, api_client
  support/                # ApiPaths, run_concurrent, get_two_account_ids
  api/                    # One file per endpoint (or resource)
    ai/                   # POST /api/v1/ai/*
    blockchain/           # /api/v1/blockchain/*
    accounts/             # /api/v1/accounts
    portfolio/            # GET portfolio, POST seed
    quotes/               # GET /api/v1/quotes
    identity/             # customers, user-preferences
    instruments/          # instruments, bonds, options
    portfolios_resource/  # portfolios, positions (CRUD)
    watchlist/            # watchlists, watchlist-items
    trading/              # orders, trades
    payments/             # cash-transactions, payments, settlements
    market_data/          # market-data
    analytics/            # risk-metrics, valuations
  unit/
    test_blockchain_service.py
```

## High concurrency

Write-endpoints that modify shared state (e.g. balances, ledger) should be designed for concurrency (e.g. pessimistic locking, single transaction) and covered by concurrency tests where applicable. Use `run_concurrent(fn, n)` from `tests.support` to run `n` parallel requests and assert invariants (e.g. final balance sum).

## Run

From repo root: `pnpm test` or `pnpm run test:api`.  
From `services/portfolio-analytics`: `python -m pytest tests -v`.
