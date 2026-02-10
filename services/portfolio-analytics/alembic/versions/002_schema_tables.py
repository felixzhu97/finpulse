"""Schema tables from database design (customer, account, instrument, etc.)

Revision ID: 002
Revises: 001
Create Date: 2025-02-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "customer",
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("kyc_status", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("customer_id"),
    )
    op.create_table(
        "user_preference",
        sa.Column("preference_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("theme", sa.Text(), nullable=True),
        sa.Column("language", sa.Text(), nullable=True),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("preference_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("customer_id", name="user_preference_customer_id_key"),
    )
    op.create_table(
        "account",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("account_type", sa.Text(), nullable=False),
        sa.Column("currency", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("opened_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("account_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_account_customer", "account", ["customer_id"])

    op.create_table(
        "instrument",
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("symbol", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("asset_class", sa.Text(), nullable=True),
        sa.Column("currency", sa.Text(), nullable=True),
        sa.Column("exchange", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("instrument_id"),
    )

    op.create_table(
        "portfolio",
        sa.Column("portfolio_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("base_currency", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("portfolio_id"),
        sa.ForeignKeyConstraint(["account_id"], ["account.account_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_portfolio_account", "portfolio", ["account_id"])

    op.create_table(
        "watchlist",
        sa.Column("watchlist_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("watchlist_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "position",
        sa.Column("position_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("portfolio_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.Numeric(20, 8), nullable=False),
        sa.Column("cost_basis", sa.Numeric(20, 8), nullable=True),
        sa.Column("as_of_date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.PrimaryKeyConstraint("position_id"),
        sa.ForeignKeyConstraint(["portfolio_id"], ["portfolio.portfolio_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_position_portfolio", "position", ["portfolio_id"])
    op.create_index("idx_position_instrument", "position", ["instrument_id"])

    op.create_table(
        "watchlist_item",
        sa.Column("watchlist_item_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("watchlist_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("watchlist_item_id"),
        sa.ForeignKeyConstraint(["watchlist_id"], ["watchlist.watchlist_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("watchlist_id", "instrument_id", name="uq_watchlist_item_watchlist_instrument"),
    )

    op.create_table(
        "bond",
        sa.Column("bond_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("face_value", sa.Numeric(20, 8), nullable=True),
        sa.Column("coupon_rate", sa.Numeric(12, 6), nullable=True),
        sa.Column("ytm", sa.Numeric(12, 6), nullable=True),
        sa.Column("duration", sa.Numeric(12, 6), nullable=True),
        sa.Column("convexity", sa.Numeric(12, 6), nullable=True),
        sa.Column("maturity_years", sa.Numeric(8, 4), nullable=True),
        sa.Column("frequency", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("bond_id"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("instrument_id", name="bond_instrument_id_key"),
    )

    op.create_table(
        "option",
        sa.Column("option_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("underlying_instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("strike", sa.Numeric(20, 8), nullable=False),
        sa.Column("expiry", sa.DateTime(timezone=True), nullable=False),
        sa.Column("option_type", sa.Text(), nullable=False),
        sa.Column("risk_free_rate", sa.Numeric(12, 6), nullable=True),
        sa.Column("volatility", sa.Numeric(12, 6), nullable=True),
        sa.Column("bs_price", sa.Numeric(20, 8), nullable=True),
        sa.Column("delta", sa.Numeric(12, 6), nullable=True),
        sa.Column("gamma", sa.Numeric(12, 6), nullable=True),
        sa.Column("theta", sa.Numeric(12, 6), nullable=True),
        sa.Column("vega", sa.Numeric(12, 6), nullable=True),
        sa.Column("rho", sa.Numeric(12, 6), nullable=True),
        sa.Column("implied_volatility", sa.Numeric(12, 6), nullable=True),
        sa.PrimaryKeyConstraint("option_id"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["underlying_instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("instrument_id", name="option_instrument_id_key"),
    )

    op.create_table(
        "orders",
        sa.Column("order_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("side", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Numeric(20, 8), nullable=False),
        sa.Column("order_type", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("order_id"),
        sa.ForeignKeyConstraint(["account_id"], ["account.account_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_orders_account", "orders", ["account_id"])

    op.create_table(
        "trade",
        sa.Column("trade_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.Numeric(20, 8), nullable=False),
        sa.Column("price", sa.Numeric(20, 8), nullable=False),
        sa.Column("fee", sa.Numeric(20, 8), nullable=True, server_default=sa.text("0")),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("trade_id"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.order_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_trade_order", "trade", ["order_id"])

    op.create_table(
        "cash_transaction",
        sa.Column("transaction_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.Text(), nullable=False),
        sa.Column("amount", sa.Numeric(20, 8), nullable=False),
        sa.Column("currency", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="completed"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("transaction_id"),
        sa.ForeignKeyConstraint(["account_id"], ["account.account_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "payment",
        sa.Column("payment_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("counterparty", sa.Text(), nullable=True),
        sa.Column("amount", sa.Numeric(20, 8), nullable=False),
        sa.Column("currency", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("payment_id"),
        sa.ForeignKeyConstraint(["account_id"], ["account.account_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "settlement",
        sa.Column("settlement_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("trade_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("payment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("settled_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("settlement_id"),
        sa.ForeignKeyConstraint(["trade_id"], ["trade.trade_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["payment_id"], ["payment.payment_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "market_data",
        sa.Column("data_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("open", sa.Numeric(20, 8), nullable=True),
        sa.Column("high", sa.Numeric(20, 8), nullable=True),
        sa.Column("low", sa.Numeric(20, 8), nullable=True),
        sa.Column("close", sa.Numeric(20, 8), nullable=False),
        sa.Column("volume", sa.Numeric(20, 4), nullable=True),
        sa.Column("change_pct", sa.Numeric(12, 6), nullable=True),
        sa.PrimaryKeyConstraint("data_id"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_market_data_instrument", "market_data", ["instrument_id"])
    op.create_index("idx_market_data_timestamp", "market_data", ["instrument_id", "timestamp"])

    op.create_table(
        "technical_indicator",
        sa.Column("indicator_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("data_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ma", sa.Numeric(20, 8), nullable=True),
        sa.Column("ema", sa.Numeric(20, 8), nullable=True),
        sa.Column("rsi", sa.Numeric(12, 6), nullable=True),
        sa.Column("macd", sa.Numeric(20, 8), nullable=True),
        sa.Column("volatility", sa.Numeric(12, 6), nullable=True),
        sa.Column("volume_metric", sa.Numeric(20, 8), nullable=True),
        sa.PrimaryKeyConstraint("indicator_id"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["data_id"], ["market_data.data_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "risk_metrics",
        sa.Column("metric_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("portfolio_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("as_of_date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("risk_level", sa.Text(), nullable=True),
        sa.Column("volatility", sa.Numeric(12, 6), nullable=True),
        sa.Column("sharpe_ratio", sa.Numeric(12, 6), nullable=True),
        sa.Column("var", sa.Numeric(20, 8), nullable=True),
        sa.Column("beta", sa.Numeric(12, 6), nullable=True),
        sa.PrimaryKeyConstraint("metric_id"),
        sa.ForeignKeyConstraint(["portfolio_id"], ["portfolio.portfolio_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_risk_metrics_portfolio", "risk_metrics", ["portfolio_id"])

    op.create_table(
        "portfolio_optimization",
        sa.Column("optimization_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("portfolio_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("as_of_date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("weights_json", sa.Text(), nullable=True),
        sa.Column("expected_return", sa.Numeric(12, 6), nullable=True),
        sa.Column("variance", sa.Numeric(12, 6), nullable=True),
        sa.Column("sharpe_ratio", sa.Numeric(12, 6), nullable=True),
        sa.Column("efficient_frontier_json", sa.Text(), nullable=True),
        sa.Column("constraints_json", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("optimization_id"),
        sa.ForeignKeyConstraint(["portfolio_id"], ["portfolio.portfolio_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "statistical",
        sa.Column("stat_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id_1", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instrument_id_2", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("as_of_date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("correlation", sa.Numeric(12, 6), nullable=True),
        sa.Column("beta", sa.Numeric(12, 6), nullable=True),
        sa.Column("alpha", sa.Numeric(12, 6), nullable=True),
        sa.Column("fama_french_factors", sa.Text(), nullable=True),
        sa.Column("regression_coefs", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("stat_id"),
        sa.ForeignKeyConstraint(["instrument_id_1"], ["instrument.instrument_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["instrument_id_2"], ["instrument.instrument_id"], ondelete="CASCADE"),
    )

    op.create_table(
        "valuation",
        sa.Column("valuation_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("instrument_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("as_of_date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("method", sa.Text(), nullable=True),
        sa.Column("ev", sa.Numeric(20, 8), nullable=True),
        sa.Column("equity_value", sa.Numeric(20, 8), nullable=True),
        sa.Column("target_price", sa.Numeric(20, 8), nullable=True),
        sa.Column("multiples", sa.Numeric(12, 6), nullable=True),
        sa.Column("discount_rate", sa.Numeric(12, 6), nullable=True),
        sa.Column("growth_rate", sa.Numeric(12, 6), nullable=True),
        sa.PrimaryKeyConstraint("valuation_id"),
        sa.ForeignKeyConstraint(["instrument_id"], ["instrument.instrument_id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("valuation")
    op.drop_table("statistical")
    op.drop_table("portfolio_optimization")
    op.drop_index("idx_risk_metrics_portfolio", table_name="risk_metrics")
    op.drop_table("risk_metrics")
    op.drop_table("technical_indicator")
    op.drop_index("idx_market_data_timestamp", table_name="market_data")
    op.drop_index("idx_market_data_instrument", table_name="market_data")
    op.drop_table("market_data")
    op.drop_table("settlement")
    op.drop_table("payment")
    op.drop_table("cash_transaction")
    op.drop_index("idx_trade_order", table_name="trade")
    op.drop_table("trade")
    op.drop_index("idx_orders_account", table_name="orders")
    op.drop_table("orders")
    op.drop_table("option")
    op.drop_table("bond")
    op.drop_table("watchlist_item")
    op.drop_index("idx_position_instrument", table_name="position")
    op.drop_index("idx_position_portfolio", table_name="position")
    op.drop_table("position")
    op.drop_table("watchlist")
    op.drop_index("idx_portfolio_account", table_name="portfolio")
    op.drop_table("portfolio")
    op.drop_table("instrument")
    op.drop_index("idx_account_customer", table_name="account")
    op.drop_table("account")
    op.drop_table("user_preference")
    op.drop_table("customer")
