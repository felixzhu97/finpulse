from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.use_cases.market_data_service import MarketDataService
from src.infrastructure.config.container import analytics_service as build_analytics_service
from src.infrastructure.config.container import market_data_service as build_market_data_service
from src.infrastructure.database.session import get_session
from src.core.application.use_cases.blockchain_service import BlockchainApplicationService
from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.infrastructure.database.repositories import (
    PortfolioHistoryRepository,
    PortfolioRepository,
    account_repo,
    blockchain_ledger_repo,
    bond_repo,
    cash_transaction_repo,
    customer_repo,
    instrument_repo,
    market_data_repo,
    option_repo,
    order_repo,
    payment_repo,
    portfolio_schema_repo,
    position_repo,
    risk_metrics_repo,
    settlement_repo,
    trade_repo,
    user_preference_repo,
    valuation_repo,
    wallet_balance_repo,
    watchlist_repo,
    watchlist_item_repo,
)
from src.infrastructure.message_brokers import EventPublisher


def get_market_data_service() -> MarketDataService:
    return build_market_data_service()


def get_analytics_service() -> AnalyticsApplicationService:
    return build_analytics_service()


async def get_portfolio_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> PortfolioApplicationService:
    history_repo = PortfolioHistoryRepository(session)
    portfolio_repo = PortfolioRepository(session, history_repo=history_repo)
    return PortfolioApplicationService(
        repository=portfolio_repo,
        event_publisher=EventPublisher(),
    )


async def get_customer_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return customer_repo(session)


async def get_user_preference_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return user_preference_repo(session)


async def get_account_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return account_repo(session)


async def get_instrument_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return instrument_repo(session)


async def get_portfolio_schema_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return portfolio_schema_repo(session)


async def get_watchlist_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return watchlist_repo(session)


async def get_position_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return position_repo(session)


async def get_watchlist_item_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return watchlist_item_repo(session)


async def get_bond_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return bond_repo(session)


async def get_option_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return option_repo(session)


async def get_order_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return order_repo(session)


async def get_trade_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return trade_repo(session)


async def get_cash_transaction_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return cash_transaction_repo(session)


async def get_payment_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return payment_repo(session)


async def get_settlement_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return settlement_repo(session)


async def get_market_data_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return market_data_repo(session)


async def get_risk_metrics_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return risk_metrics_repo(session)


async def get_valuation_repo(session: Annotated[AsyncSession, Depends(get_session)]):
    return valuation_repo(session)


async def get_blockchain_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> BlockchainApplicationService:
    return BlockchainApplicationService(
        ledger=blockchain_ledger_repo(session),
        wallet_repository=wallet_balance_repo(session),
    )
