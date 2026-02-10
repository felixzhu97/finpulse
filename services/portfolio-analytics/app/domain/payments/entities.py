from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class CashTransaction:
    transaction_id: UUID
    account_id: UUID
    type: str
    amount: float
    currency: str
    status: str
    created_at: datetime


@dataclass
class Payment:
    payment_id: UUID
    account_id: UUID
    counterparty: str | None
    amount: float
    currency: str
    status: str
    created_at: datetime


@dataclass
class Settlement:
    settlement_id: UUID
    trade_id: UUID
    payment_id: UUID
    status: str
    settled_at: datetime | None
