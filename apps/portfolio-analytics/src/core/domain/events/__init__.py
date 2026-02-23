from __future__ import annotations

from abc import ABC
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import UUID, uuid4


@dataclass(frozen=True)
class DomainEvent(ABC):
    event_id: UUID
    occurred_at: datetime
    aggregate_id: str

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)


@dataclass(frozen=True)
class PortfolioEvent(DomainEvent):
    event_type: str
    portfolio_id: str
    payload: dict

    @classmethod
    def create(cls, event_type: str, portfolio_id: str, payload: dict) -> PortfolioEvent:
        return cls(
            event_id=uuid4(),
            occurred_at=datetime.now(timezone.utc),
            aggregate_id=portfolio_id,
            event_type=event_type,
            portfolio_id=portfolio_id,
            payload=payload,
        )
