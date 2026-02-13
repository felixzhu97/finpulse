from typing import Annotated, Callable

from fastapi import Depends, Request, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.use_cases.blockchain_service import BlockchainApplicationService
from src.core.application.use_cases.market_data_service import MarketDataService
from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.core.application.use_cases.quote_history_service import QuoteHistoryService
from src.infrastructure.analytics import ClickHouseAnalyticsClient
from src.infrastructure.cache import RedisCache
from src.infrastructure.config.container import (
    analytics_service as build_analytics_service,
    blockchain_service as build_blockchain_service,
    market_data_service as build_market_data_service,
    portfolio_history_repo as build_portfolio_history_repo,
    portfolio_service as build_portfolio_service,
    quote_history_service as build_quote_history_service,
)
from src.infrastructure.database.repositories import (
    account_repo,
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
    watchlist_repo,
    watchlist_item_repo,
)
from src.infrastructure.database.session import get_session


def _repo_from_session(factory: Callable[[AsyncSession], object]):
    async def _get(session: Annotated[AsyncSession, Depends(get_session)]):
        return factory(session)
    return _get


def get_clickhouse_analytics() -> ClickHouseAnalyticsClient:
    return ClickHouseAnalyticsClient()


def get_model_loader():
    from src.infrastructure.ml import MLflowModelLoader
    return MLflowModelLoader()


def get_realtime_quote_repo(
    request: Request = None,
    websocket: WebSocket = None,
):
    app = (request or websocket).app
    return getattr(app.state, "realtime_quote_repo", None)


def get_market_data_service(
    repo=Depends(get_realtime_quote_repo),
) -> MarketDataService:
    return build_market_data_service(repo)


def get_quote_history_service(
    repo=Depends(get_realtime_quote_repo),
) -> QuoteHistoryService:
    return build_quote_history_service(repo)


def get_analytics_service() -> AnalyticsApplicationService:
    return build_analytics_service()


def get_redis(request: Request):
    return getattr(request.app.state, "redis", None)


def get_cache(
    request: Request,
) -> RedisCache:
    redis_client = getattr(request.app.state, "redis", None)
    return RedisCache(redis_client)


async def get_portfolio_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    request: Request,
) -> PortfolioApplicationService:
    redis_client = getattr(request.app.state, "redis", None)
    return build_portfolio_service(session, redis_client)


get_customer_repo = _repo_from_session(customer_repo)
get_user_preference_repo = _repo_from_session(user_preference_repo)
get_account_repo = _repo_from_session(account_repo)
get_instrument_repo = _repo_from_session(instrument_repo)
get_portfolio_schema_repo = _repo_from_session(portfolio_schema_repo)
get_watchlist_repo = _repo_from_session(watchlist_repo)
get_position_repo = _repo_from_session(position_repo)
get_watchlist_item_repo = _repo_from_session(watchlist_item_repo)
get_bond_repo = _repo_from_session(bond_repo)
get_option_repo = _repo_from_session(option_repo)
get_order_repo = _repo_from_session(order_repo)
get_trade_repo = _repo_from_session(trade_repo)
get_cash_transaction_repo = _repo_from_session(cash_transaction_repo)
get_payment_repo = _repo_from_session(payment_repo)
get_settlement_repo = _repo_from_session(settlement_repo)
get_market_data_repo = _repo_from_session(market_data_repo)
get_risk_metrics_repo = _repo_from_session(risk_metrics_repo)
get_valuation_repo = _repo_from_session(valuation_repo)


async def get_blockchain_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> BlockchainApplicationService:
    return build_blockchain_service(session)


async def get_portfolio_history_repo(
    session: Annotated[AsyncSession, Depends(get_session)],
    request: Request,
):
    redis_client = getattr(request.app.state, "redis", None)
    return build_portfolio_history_repo(session, redis_client)
