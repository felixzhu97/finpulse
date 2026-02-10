from __future__ import annotations

from typing import Protocol

from src.core.domain.events import DomainEvent


class IEventPublisherPort(Protocol):
    def publish(self, event: DomainEvent) -> None:
        ...
