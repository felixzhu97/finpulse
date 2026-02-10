from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.common import now_utc
from app.api.schemas import (
    WatchlistCreate,
    WatchlistResponse,
    WatchlistItemCreate,
    WatchlistItemResponse,
)
from app.dependencies import get_watchlist_repo, get_watchlist_item_repo
from app.domain.watchlist import Watchlist, WatchlistItem


def _watchlist_to_response(e: Watchlist) -> WatchlistResponse:
    return WatchlistResponse(
        watchlist_id=e.watchlist_id,
        customer_id=e.customer_id,
        name=e.name,
        created_at=e.created_at,
    )


def _watchlist_item_to_response(e: WatchlistItem) -> WatchlistItemResponse:
    return WatchlistItemResponse(
        watchlist_item_id=e.watchlist_item_id,
        watchlist_id=e.watchlist_id,
        instrument_id=e.instrument_id,
        added_at=e.added_at,
    )


def register(router: APIRouter) -> None:
    now = now_utc

    @router.get("/watchlists", response_model=list[WatchlistResponse])
    async def list_watchlists(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_watchlist_repo)] = None,
    ):
        return [_watchlist_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/watchlists/{watchlist_id}", response_model=WatchlistResponse)
    async def get_watchlist(
        watchlist_id: UUID,
        repo: Annotated[object, Depends(get_watchlist_repo)] = None,
    ):
        entity = await repo.get_by_id(watchlist_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Watchlist not found")
        return _watchlist_to_response(entity)

    @router.post("/watchlists", response_model=WatchlistResponse, status_code=201)
    async def create_watchlist(
        body: WatchlistCreate,
        repo: Annotated[object, Depends(get_watchlist_repo)] = None,
    ):
        entity = Watchlist(
            watchlist_id=uuid4(),
            customer_id=body.customer_id,
            name=body.name,
            created_at=now(),
        )
        created = await repo.add(entity)
        return _watchlist_to_response(created)

    @router.put("/watchlists/{watchlist_id}", response_model=WatchlistResponse)
    async def update_watchlist(
        watchlist_id: UUID,
        body: WatchlistCreate,
        repo: Annotated[object, Depends(get_watchlist_repo)] = None,
    ):
        existing = await repo.get_by_id(watchlist_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Watchlist not found")
        entity = Watchlist(
            watchlist_id=watchlist_id,
            customer_id=body.customer_id,
            name=body.name,
            created_at=existing.created_at,
        )
        updated = await repo.save(entity)
        return _watchlist_to_response(updated)

    @router.delete("/watchlists/{watchlist_id}", status_code=204)
    async def delete_watchlist(
        watchlist_id: UUID,
        repo: Annotated[object, Depends(get_watchlist_repo)] = None,
    ):
        ok = await repo.remove(watchlist_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Watchlist not found")

    @router.get("/watchlist-items", response_model=list[WatchlistItemResponse])
    async def list_watchlist_items(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_watchlist_item_repo)] = None,
    ):
        return [_watchlist_item_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/watchlist-items/{watchlist_item_id}", response_model=WatchlistItemResponse)
    async def get_watchlist_item(
        watchlist_item_id: UUID,
        repo: Annotated[object, Depends(get_watchlist_item_repo)] = None,
    ):
        entity = await repo.get_by_id(watchlist_item_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        return _watchlist_item_to_response(entity)

    @router.post("/watchlist-items", response_model=WatchlistItemResponse, status_code=201)
    async def create_watchlist_item(
        body: WatchlistItemCreate,
        repo: Annotated[object, Depends(get_watchlist_item_repo)] = None,
    ):
        entity = WatchlistItem(
            watchlist_item_id=uuid4(),
            watchlist_id=body.watchlist_id,
            instrument_id=body.instrument_id,
            added_at=now(),
        )
        created = await repo.add(entity)
        return _watchlist_item_to_response(created)

    @router.put("/watchlist-items/{watchlist_item_id}", response_model=WatchlistItemResponse)
    async def update_watchlist_item(
        watchlist_item_id: UUID,
        body: WatchlistItemCreate,
        repo: Annotated[object, Depends(get_watchlist_item_repo)] = None,
    ):
        existing = await repo.get_by_id(watchlist_item_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        entity = WatchlistItem(
            watchlist_item_id=watchlist_item_id,
            watchlist_id=body.watchlist_id,
            instrument_id=body.instrument_id,
            added_at=existing.added_at,
        )
        updated = await repo.save(entity)
        return _watchlist_item_to_response(updated)

    @router.delete("/watchlist-items/{watchlist_item_id}", status_code=204)
    async def delete_watchlist_item(
        watchlist_item_id: UUID,
        repo: Annotated[object, Depends(get_watchlist_item_repo)] = None,
    ):
        ok = await repo.remove(watchlist_item_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
