"""Initial schema: portfolio, portfolio_history (TimescaleDB)

Revision ID: 001
Revises:
Create Date: 2025-02-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
    op.create_table(
        "portfolio_legacy",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "portfolio_history",
        sa.Column("time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("portfolio_id", sa.Text(), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("time", "portfolio_id"),
        sa.UniqueConstraint("portfolio_id", "time", name="uq_portfolio_history_portfolio_time"),
    )
    op.execute("SELECT create_hypertable('portfolio_history', 'time', if_not_exists => TRUE)")
    op.create_index(
        "idx_portfolio_history_portfolio_time",
        "portfolio_history",
        ["portfolio_id", "time"],
    )


def downgrade() -> None:
    op.drop_index("idx_portfolio_history_portfolio_time", table_name="portfolio_history")
    op.drop_table("portfolio_history")
    op.drop_table("portfolio_legacy")
