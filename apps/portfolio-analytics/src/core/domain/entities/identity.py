from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Customer:
    customer_id: UUID
    name: str
    email: str | None
    kyc_status: str | None
    created_at: datetime


@dataclass
class UserPreference:
    preference_id: UUID
    customer_id: UUID
    theme: str | None
    language: str | None
    notifications_enabled: bool
    updated_at: datetime
