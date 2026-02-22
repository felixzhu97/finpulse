from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Block:
    index: int
    timestamp: datetime
    previous_hash: str
    transaction_ids: tuple[str, ...]
    hash: str


@dataclass
class ChainTransaction:
    tx_id: UUID
    block_index: int
    sender_account_id: UUID
    receiver_account_id: UUID
    amount: float
    currency: str
    created_at: datetime


@dataclass
class WalletBalance:
    account_id: UUID
    currency: str
    balance: float
    updated_at: datetime
