from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Quote:
    symbol: str
    price: float
    change: float
    change_rate: float
    volume: float | None = None
    timestamp: float = 0.0

