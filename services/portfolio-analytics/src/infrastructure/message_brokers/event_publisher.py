import json
from typing import Any, Optional

from src.core.domain.events import DomainEvent, PortfolioEvent
from src.infrastructure.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_PORTFOLIO_TOPIC

_producer: Optional[Any] = None


def _get_producer() -> Optional[Any]:
    global _producer
    if _producer is None:
        try:
            from confluent_kafka import Producer
            _producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS})
        except Exception:
            return None
    return _producer


class EventPublisher:
    def publish(self, event: DomainEvent) -> None:
        if not isinstance(event, PortfolioEvent):
            return
        producer = _get_producer()
        if not producer:
            return
        try:
            value = json.dumps({
                "type": event.event_type,
                "portfolio_id": event.portfolio_id,
                "payload": event.payload,
            }).encode("utf-8")
            producer.produce(KAFKA_PORTFOLIO_TOPIC, value=value)
            producer.flush(timeout=2)
        except Exception:
            pass
