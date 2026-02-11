from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.database.session import Base


class PortfolioRow(Base):
    __tablename__ = "portfolio_legacy"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)


class PortfolioHistoryRow(Base):
    __tablename__ = "portfolio_history"

    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    portfolio_id: Mapped[str] = mapped_column(Text, primary_key=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("portfolio_id", "time", name="uq_portfolio_history_portfolio_time"),
    )


class CustomerRow(Base):
    __tablename__ = "customer"

    customer_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    kyc_status: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class UserPreferenceRow(Base):
    __tablename__ = "user_preference"

    preference_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customer.customer_id", ondelete="CASCADE"), nullable=False, unique=True)
    theme: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class AccountRow(Base):
    __tablename__ = "account"

    account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customer.customer_id", ondelete="CASCADE"), nullable=False)
    account_type: Mapped[str] = mapped_column(Text, nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("active"))
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class InstrumentRow(Base):
    __tablename__ = "instrument"

    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    symbol: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    asset_class: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    exchange: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class PortfolioSchemaRow(Base):
    __tablename__ = "portfolio"

    portfolio_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    base_currency: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class WatchlistRow(Base):
    __tablename__ = "watchlist"

    watchlist_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customer.customer_id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class PositionRow(Base):
    __tablename__ = "position"

    position_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    portfolio_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolio.portfolio_id", ondelete="CASCADE"), nullable=False)
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    cost_basis: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))


class WatchlistItemRow(Base):
    __tablename__ = "watchlist_item"

    watchlist_item_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    watchlist_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("watchlist.watchlist_id", ondelete="CASCADE"), nullable=False)
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (UniqueConstraint("watchlist_id", "instrument_id", name="uq_watchlist_item_watchlist_instrument"),)


class BondRow(Base):
    __tablename__ = "bond"

    bond_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False, unique=True)
    face_value: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    coupon_rate: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    ytm: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    duration: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    convexity: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    maturity_years: Mapped[Optional[float]] = mapped_column(Numeric(8, 4), nullable=True)
    frequency: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class OptionRow(Base):
    __tablename__ = "option"

    option_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False, unique=True)
    underlying_instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    strike: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    expiry: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    option_type: Mapped[str] = mapped_column(Text, nullable=False)
    risk_free_rate: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    volatility: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    bs_price: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    delta: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    gamma: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    theta: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    vega: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    rho: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    implied_volatility: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)


class OrderRow(Base):
    __tablename__ = "orders"

    order_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), nullable=False)
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    side: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    order_type: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("pending"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class TradeRow(Base):
    __tablename__ = "trade"

    trade_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    order_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    fee: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True, server_default=text("0"))
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class CashTransactionRow(Base):
    __tablename__ = "cash_transaction"

    transaction_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("completed"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class PaymentRow(Base):
    __tablename__ = "payment"

    payment_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), nullable=False)
    counterparty: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("pending"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class SettlementRow(Base):
    __tablename__ = "settlement"

    settlement_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    trade_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trade.trade_id", ondelete="CASCADE"), nullable=False)
    payment_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("payment.payment_id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("pending"))
    settled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class MarketDataRow(Base):
    __tablename__ = "market_data"

    data_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    open: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    high: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    low: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    close: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    volume: Mapped[Optional[float]] = mapped_column(Numeric(20, 4), nullable=True)
    change_pct: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)


class TechnicalIndicatorRow(Base):
    __tablename__ = "technical_indicator"

    indicator_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=None)
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    data_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("market_data.data_id", ondelete="CASCADE"), nullable=False)
    ma: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    ema: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    rsi: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    macd: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    volatility: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    volume_metric: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)


class RiskMetricsRow(Base):
    __tablename__ = "risk_metrics"

    metric_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    portfolio_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolio.portfolio_id", ondelete="CASCADE"), nullable=False)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    risk_level: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    volatility: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    sharpe_ratio: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    var: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    beta: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)


class PortfolioOptimizationRow(Base):
    __tablename__ = "portfolio_optimization"

    optimization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    portfolio_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolio.portfolio_id", ondelete="CASCADE"), nullable=False)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    weights_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expected_return: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    variance: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    sharpe_ratio: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    efficient_frontier_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    constraints_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class StatisticalRow(Base):
    __tablename__ = "statistical"

    stat_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    instrument_id_1: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    instrument_id_2: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    correlation: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    beta: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    alpha: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    fama_french_factors: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    regression_coefs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ValuationRow(Base):
    __tablename__ = "valuation"

    valuation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    instrument_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instrument.instrument_id", ondelete="CASCADE"), nullable=False)
    as_of_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    method: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ev: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    equity_value: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    target_price: Mapped[Optional[float]] = mapped_column(Numeric(20, 8), nullable=True)
    multiples: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    discount_rate: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)
    growth_rate: Mapped[Optional[float]] = mapped_column(Numeric(12, 6), nullable=True)


class BlockRow(Base):
    __tablename__ = "block"

    block_index: Mapped[int] = mapped_column(Integer, primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    previous_hash: Mapped[str] = mapped_column(Text, nullable=False)
    hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class ChainTransactionRow(Base):
    __tablename__ = "chain_transaction"

    tx_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    block_index: Mapped[int] = mapped_column(Integer, ForeignKey("block.block_index", ondelete="CASCADE"), nullable=False)
    sender_account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), nullable=False)
    receiver_account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class WalletBalanceRow(Base):
    __tablename__ = "wallet_balance"

    account_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("account.account_id", ondelete="CASCADE"), primary_key=True)
    currency: Mapped[str] = mapped_column(Text, primary_key=True)
    balance: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False, server_default=text("0"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class RealtimeQuoteRow(Base):
    __tablename__ = "realtime_quote"

    symbol: Mapped[str] = mapped_column(String(32), primary_key=True)
    price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    change: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    change_rate: Mapped[float] = mapped_column(Numeric(12, 6), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class QuoteTickRow(Base):
    __tablename__ = "quote_tick"

    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    symbol: Mapped[str] = mapped_column(String(32), primary_key=True)
    price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    change: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    change_rate: Mapped[float] = mapped_column(Numeric(12, 6), nullable=False)
