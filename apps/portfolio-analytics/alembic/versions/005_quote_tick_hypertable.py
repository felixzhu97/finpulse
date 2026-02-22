"""Quote tick hypertable for TimescaleDB time-series storage

Revision ID: 005
Revises: 004
Create Date: 2025-02-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
    op.create_table(
        "quote_tick",
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
        sa.Column("symbol", sa.String(32), nullable=False),
        sa.Column("price", sa.Numeric(20, 8), nullable=False),
        sa.Column("change", sa.Numeric(20, 8), nullable=False),
        sa.Column("change_rate", sa.Numeric(12, 6), nullable=False),
    )
    op.execute(
        "SELECT create_hypertable('quote_tick', 'ts', "
        "chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE)"
    )
    op.create_index("idx_quote_tick_symbol_ts", "quote_tick", ["symbol", "ts"])


def downgrade() -> None:
    op.drop_table("quote_tick")
