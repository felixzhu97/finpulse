"""TimescaleDB continuous aggregates and compression for quote_tick

Revision ID: 006
Revises: 005
Create Date: 2025-02-11

"""
from typing import Sequence, Union

from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS quote_ohlc_1min
        WITH (timescaledb.continuous) AS
        SELECT
            time_bucket('1 minute', ts) AS bucket,
            symbol,
            first(price, ts) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, ts) AS close
        FROM quote_tick
        GROUP BY 1, 2
        WITH NO DATA
    """)
    op.execute(
        "SELECT add_continuous_aggregate_policy('quote_ohlc_1min', "
        "start_offset => INTERVAL '1 hour', end_offset => INTERVAL '1 minute', "
        "schedule_interval => INTERVAL '1 minute', if_not_exists => TRUE)"
    )
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS quote_ohlc_5min
        WITH (timescaledb.continuous) AS
        SELECT
            time_bucket('5 minutes', ts) AS bucket,
            symbol,
            first(price, ts) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, ts) AS close
        FROM quote_tick
        GROUP BY 1, 2
        WITH NO DATA
    """)
    op.execute(
        "SELECT add_continuous_aggregate_policy('quote_ohlc_5min', "
        "start_offset => INTERVAL '3 hours', end_offset => INTERVAL '5 minutes', "
        "schedule_interval => INTERVAL '5 minutes', if_not_exists => TRUE)"
    )
    op.execute("ALTER TABLE quote_tick SET (timescaledb.compress, timescaledb.compress_segmentby = 'symbol')")
    op.execute("SELECT add_compression_policy('quote_tick', INTERVAL '7 days', if_not_exists => TRUE)")


def downgrade() -> None:
    op.execute("SELECT remove_compression_policy('quote_tick', if_exists => TRUE)")
    op.execute("ALTER TABLE quote_tick SET (timescaledb.compress = false)")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS quote_ohlc_5min")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS quote_ohlc_1min")
