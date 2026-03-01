from typing import Annotated, Callable

from fastapi import Depends, Request, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.use_cases.market_data_service import MarketDataService
from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.core.application.use_cases.quote_history_service import QuoteHistoryService
from src.infrastructure.analytics import ClickHouseAnalyticsClient
from src.infrastructure.cache import RedisCache
from src.infrastructure.config.container import (
    analytics_service as build_analytics_service,
    market_data_service as build_market_data_service,
    portfolio_history_repo as build_portfolio_history_repo,
    portfolio_service as build_portfolio_service,
    quote_history_service as build_quote_history_service,
)
from src.infrastructure.database.repositories import (
    risk_metrics_repo,
    valuation_repo,
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


get_risk_metrics_repo = _repo_from_session(risk_metrics_repo)
get_valuation_repo = _repo_from_session(valuation_repo)


async def get_portfolio_history_repo(
    session: Annotated[AsyncSession, Depends(get_session)],
    request: Request,
):
    redis_client = getattr(request.app.state, "redis", None)
    return build_portfolio_history_repo(session, redis_client)
