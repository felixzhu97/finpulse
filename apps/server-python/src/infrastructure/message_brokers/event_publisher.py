import json
from typing import Any, Iterable, Optional

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


def _to_kafka_value(event: PortfolioEvent) -> bytes:
    return json.dumps({
        "type": event.event_type,
        "portfolio_id": event.portfolio_id,
        "payload": event.payload,
    }).encode("utf-8")


class EventPublisher:
    def publish(self, event: DomainEvent) -> None:
        if not isinstance(event, PortfolioEvent):
            return
        producer = _get_producer()
        if not producer:
            return
        try:
            producer.produce(KAFKA_PORTFOLIO_TOPIC, value=_to_kafka_value(event))
            producer.flush(timeout=2)
        except Exception:
            pass

    def publish_batch(self, events: Iterable[DomainEvent]) -> None:
        producer = _get_producer()
        if not producer:
            return
        count = 0
        try:
            for event in events:
                if not isinstance(event, PortfolioEvent):
                    continue
                producer.produce(KAFKA_PORTFOLIO_TOPIC, value=_to_kafka_value(event))
                count += 1
            if count > 0:
                producer.flush(timeout=2)
        except Exception:
            pass
