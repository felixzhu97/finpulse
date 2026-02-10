from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Order:
    order_id: UUID
    account_id: UUID
    instrument_id: UUID
    side: str
    quantity: float
    order_type: str
    status: str
    created_at: datetime


@dataclass
class Trade:
    trade_id: UUID
    order_id: UUID
    quantity: float
    price: float
    fee: float | None
    executed_at: datetime
