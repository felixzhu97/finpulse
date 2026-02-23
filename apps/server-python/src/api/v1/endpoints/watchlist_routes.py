from uuid import UUID, uuid4

from fastapi import APIRouter

from src.api.v1.endpoints.common import now_utc
from src.api.v1.endpoints.crud_helpers import register_crud
from src.api.v1.schemas import (
    WatchlistCreate,
    WatchlistResponse,
    WatchlistItemCreate,
    WatchlistItemResponse,
)
from src.api.dependencies import get_watchlist_repo, get_watchlist_item_repo
from src.core.domain.entities.watchlist import Watchlist, WatchlistItem


def _watchlist_response(e: Watchlist) -> WatchlistResponse:
    return WatchlistResponse(watchlist_id=e.watchlist_id, customer_id=e.customer_id, name=e.name, created_at=e.created_at)


def _watchlist_item_response(e: WatchlistItem) -> WatchlistItemResponse:
    return WatchlistItemResponse(watchlist_item_id=e.watchlist_item_id, watchlist_id=e.watchlist_id, instrument_id=e.instrument_id, added_at=e.added_at)


def register(router: APIRouter) -> None:
    register_crud(
        router, "watchlists", "watchlist_id",
        WatchlistCreate, WatchlistResponse, get_watchlist_repo,
        _watchlist_response,
        lambda b: Watchlist(watchlist_id=uuid4(), customer_id=b.customer_id, name=b.name, created_at=now_utc()),
        lambda pk, b, ex: Watchlist(watchlist_id=pk, customer_id=b.customer_id, name=b.name, created_at=ex.created_at),
        "Watchlist not found",
    )
    register_crud(
        router, "watchlist-items", "watchlist_item_id",
        WatchlistItemCreate, WatchlistItemResponse, get_watchlist_item_repo,
        _watchlist_item_response,
        lambda b: WatchlistItem(watchlist_item_id=uuid4(), watchlist_id=b.watchlist_id, instrument_id=b.instrument_id, added_at=now_utc()),
        lambda pk, b, ex: WatchlistItem(watchlist_item_id=pk, watchlist_id=b.watchlist_id, instrument_id=b.instrument_id, added_at=ex.added_at),
        "Watchlist item not found",
    )
