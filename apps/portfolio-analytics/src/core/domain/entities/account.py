from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Account:
    account_id: UUID
    customer_id: UUID
    account_type: str
    currency: str
    status: str
    opened_at: datetime
