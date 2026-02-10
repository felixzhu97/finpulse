from __future__ import annotations

from typing import Protocol


class IEventPublisherPort(Protocol):
    def publish_portfolio_event(self, event_type: str, portfolio_id: str, payload: dict) -> None: ...
