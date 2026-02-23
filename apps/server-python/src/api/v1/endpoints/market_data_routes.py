from uuid import UUID, uuid4

from fastapi import APIRouter

from src.api.v1.endpoints.crud_helpers import register_crud
from src.api.v1.schemas import MarketDataCreate, MarketDataResponse
from src.api.dependencies import get_market_data_repo
from src.core.domain.entities.market_data import MarketData


def _response(e: MarketData) -> MarketDataResponse:
    return MarketDataResponse(
        data_id=e.data_id,
        instrument_id=e.instrument_id,
        timestamp=e.timestamp,
        open=e.open,
        high=e.high,
        low=e.low,
        close=e.close,
        volume=e.volume,
        change_pct=e.change_pct,
    )


def register(router: APIRouter) -> None:
    register_crud(
        router, "market-data", "data_id",
        MarketDataCreate, MarketDataResponse, get_market_data_repo,
        _response,
        lambda b: MarketData(data_id=uuid4(), instrument_id=b.instrument_id, timestamp=b.timestamp, open=b.open, high=b.high, low=b.low, close=b.close, volume=b.volume, change_pct=b.change_pct),
        lambda pk, b, _: MarketData(data_id=pk, instrument_id=b.instrument_id, timestamp=b.timestamp, open=b.open, high=b.high, low=b.low, close=b.close, volume=b.volume, change_pct=b.change_pct),
        "Market data not found",
    )
