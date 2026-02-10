from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.account.entities import Account
from app.domain.analytics.entities import RiskMetrics, Valuation
from app.domain.identity.entities import Customer, UserPreference
from app.domain.instrument.entities import Bond, Instrument, Option
from app.domain.market_data.entities import MarketData
from app.domain.payments.entities import CashTransaction, Payment, Settlement
from app.domain.portfolio.entities import PortfolioSchema, Position
from app.domain.trading.entities import Order, Trade
from app.domain.watchlist.entities import Watchlist, WatchlistItem
from app.infrastructure.persistence.persistence_mappers import (
    account_entity_to_dict,
    account_row_to_entity,
    bond_entity_to_dict,
    bond_row_to_entity,
    cash_transaction_entity_to_dict,
    cash_transaction_row_to_entity,
    customer_entity_to_dict,
    customer_row_to_entity,
    instrument_entity_to_dict,
    instrument_row_to_entity,
    market_data_entity_to_dict,
    market_data_row_to_entity,
    option_entity_to_dict,
    option_row_to_entity,
    order_entity_to_dict,
    order_row_to_entity,
    payment_entity_to_dict,
    payment_row_to_entity,
    portfolio_schema_entity_to_dict,
    portfolio_schema_row_to_entity,
    position_entity_to_dict,
    position_row_to_entity,
    risk_metrics_entity_to_dict,
    risk_metrics_row_to_entity,
    settlement_entity_to_dict,
    settlement_row_to_entity,
    trade_entity_to_dict,
    trade_row_to_entity,
    user_preference_entity_to_dict,
    user_preference_row_to_entity,
    valuation_entity_to_dict,
    valuation_row_to_entity,
    watchlist_entity_to_dict,
    watchlist_item_entity_to_dict,
    watchlist_item_row_to_entity,
    watchlist_row_to_entity,
)
from app.infrastructure.persistence.sql_repository import SqlRepository
from app.models import (
    AccountRow,
    BondRow,
    CashTransactionRow,
    CustomerRow,
    InstrumentRow,
    MarketDataRow,
    OptionRow,
    OrderRow,
    PaymentRow,
    PositionRow,
    PortfolioSchemaRow,
    RiskMetricsRow,
    SettlementRow,
    TradeRow,
    UserPreferenceRow,
    ValuationRow,
    WatchlistRow,
    WatchlistItemRow,
)


def customer_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session, CustomerRow, "customer_id", customer_row_to_entity, customer_entity_to_dict
    )


def user_preference_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        UserPreferenceRow,
        "preference_id",
        user_preference_row_to_entity,
        user_preference_entity_to_dict,
    )


def account_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session, AccountRow, "account_id", account_row_to_entity, account_entity_to_dict
    )


def instrument_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        InstrumentRow,
        "instrument_id",
        instrument_row_to_entity,
        instrument_entity_to_dict,
    )


def portfolio_schema_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        PortfolioSchemaRow,
        "portfolio_id",
        portfolio_schema_row_to_entity,
        portfolio_schema_entity_to_dict,
    )


def watchlist_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        WatchlistRow,
        "watchlist_id",
        watchlist_row_to_entity,
        watchlist_entity_to_dict,
    )


def position_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        PositionRow,
        "position_id",
        position_row_to_entity,
        position_entity_to_dict,
    )


def watchlist_item_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        WatchlistItemRow,
        "watchlist_item_id",
        watchlist_item_row_to_entity,
        watchlist_item_entity_to_dict,
    )


def bond_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session, BondRow, "bond_id", bond_row_to_entity, bond_entity_to_dict
    )


def option_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session, OptionRow, "option_id", option_row_to_entity, option_entity_to_dict
    )


def order_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session, OrderRow, "order_id", order_row_to_entity, order_entity_to_dict
    )


def trade_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session, TradeRow, "trade_id", trade_row_to_entity, trade_entity_to_dict
    )


def cash_transaction_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        CashTransactionRow,
        "transaction_id",
        cash_transaction_row_to_entity,
        cash_transaction_entity_to_dict,
    )


def payment_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        PaymentRow,
        "payment_id",
        payment_row_to_entity,
        payment_entity_to_dict,
    )


def settlement_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        SettlementRow,
        "settlement_id",
        settlement_row_to_entity,
        settlement_entity_to_dict,
    )


def market_data_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        MarketDataRow,
        "data_id",
        market_data_row_to_entity,
        market_data_entity_to_dict,
    )


def risk_metrics_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        RiskMetricsRow,
        "metric_id",
        risk_metrics_row_to_entity,
        risk_metrics_entity_to_dict,
    )


def valuation_repo(session: AsyncSession) -> SqlRepository:
    return SqlRepository(
        session,
        ValuationRow,
        "valuation_id",
        valuation_row_to_entity,
        valuation_entity_to_dict,
    )
