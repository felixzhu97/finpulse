from fastapi import APIRouter

from src.api.v1.endpoints import (
    account_routes,
    analytics_routes,
    blockchain_routes,
    identity_routes,
    instrument_routes,
    market_data_routes,
    payments_routes,
    portfolio_routes,
    trading_routes,
    watchlist_routes,
)


def register_all_resources(router: APIRouter) -> None:
    identity_routes.register(router)
    account_routes.register(router)
    instrument_routes.register(router)
    portfolio_routes.register(router)
    watchlist_routes.register(router)
    trading_routes.register(router)
    payments_routes.register(router)
    blockchain_routes.register(router)
    market_data_routes.register(router)
    analytics_routes.register(router)
