from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Watchlist:
    watchlist_id: UUID
    customer_id: UUID
    name: str
    created_at: datetime


@dataclass
class WatchlistItem:
    watchlist_item_id: UUID
    watchlist_id: UUID
    instrument_id: UUID
    added_at: datetime
