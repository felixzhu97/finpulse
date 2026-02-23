-- DEPRECATED: Schema is now managed by Alembic (alembic/versions/001_initial.py).
-- Use: alembic upgrade head
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS portfolio_history (
    time TIMESTAMPTZ NOT NULL,
    portfolio_id TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    UNIQUE (portfolio_id, time)
);

SELECT create_hypertable('portfolio_history', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_portfolio_history_portfolio_time
    ON portfolio_history (portfolio_id, time DESC);
