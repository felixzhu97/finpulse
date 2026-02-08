import json
from typing import Any, Optional

from app.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_PORTFOLIO_TOPIC

_producer: Optional[Any] = None


def _get_producer():
  global _producer
  if _producer is None:
    try:
      from confluent_kafka import Producer
      _producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS})
    except Exception:
      return None
  return _producer


class EventPublisher:
  def publish_portfolio_event(self, event_type: str, portfolio_id: str, payload: dict) -> None:
    producer = _get_producer()
    if not producer:
      return
    try:
      value = json.dumps({
        "type": event_type,
        "portfolio_id": portfolio_id,
        "payload": payload,
      }).encode("utf-8")
      producer.produce(KAFKA_PORTFOLIO_TOPIC, value=value)
      producer.flush(timeout=2)
    except Exception:
      pass
