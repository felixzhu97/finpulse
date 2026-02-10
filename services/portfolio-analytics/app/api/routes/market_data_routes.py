from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.schemas import MarketDataCreate, MarketDataResponse
from app.dependencies import get_market_data_repo
from app.domain.market_data import MarketData


def _to_response(e: MarketData) -> MarketDataResponse:
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
    @router.get("/market-data", response_model=list[MarketDataResponse])
    async def list_market_data(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_market_data_repo)] = None,
    ):
        return [_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/market-data/{data_id}", response_model=MarketDataResponse)
    async def get_market_data(
        data_id: UUID,
        repo: Annotated[object, Depends(get_market_data_repo)] = None,
    ):
        entity = await repo.get_by_id(data_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Market data not found")
        return _to_response(entity)

    @router.post("/market-data", response_model=MarketDataResponse, status_code=201)
    async def create_market_data(
        body: MarketDataCreate,
        repo: Annotated[object, Depends(get_market_data_repo)] = None,
    ):
        entity = MarketData(
            data_id=uuid4(),
            instrument_id=body.instrument_id,
            timestamp=body.timestamp,
            open=body.open,
            high=body.high,
            low=body.low,
            close=body.close,
            volume=body.volume,
            change_pct=body.change_pct,
        )
        created = await repo.add(entity)
        return _to_response(created)

    @router.put("/market-data/{data_id}", response_model=MarketDataResponse)
    async def update_market_data(
        data_id: UUID,
        body: MarketDataCreate,
        repo: Annotated[object, Depends(get_market_data_repo)] = None,
    ):
        entity = MarketData(
            data_id=data_id,
            instrument_id=body.instrument_id,
            timestamp=body.timestamp,
            open=body.open,
            high=body.high,
            low=body.low,
            close=body.close,
            volume=body.volume,
            change_pct=body.change_pct,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Market data not found")
        return _to_response(updated)

    @router.delete("/market-data/{data_id}", status_code=204)
    async def delete_market_data(
        data_id: UUID,
        repo: Annotated[object, Depends(get_market_data_repo)] = None,
    ):
        ok = await repo.remove(data_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Market data not found")
