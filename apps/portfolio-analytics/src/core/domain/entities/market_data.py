from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Quote:
    symbol: str
    price: float
    change: float
    change_rate: float
    volume: float | None = None
    timestamp: float = 0.0


@dataclass
class MarketData:
    data_id: UUID
    instrument_id: UUID
    timestamp: datetime
    open: float | None
    high: float | None
    low: float | None
    close: float
    volume: float | None
    change_pct: float | None

