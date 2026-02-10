import json
import threading
import time
from typing import Dict, Iterable, Optional

from src.infrastructure.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_QUOTES_ENRICHED_TOPIC
from src.core.domain.entities.market_data import Quote
from src.core.application.ports.services.market_data_provider import IMarketDataProvider


_quotes_lock = threading.Lock()
_quotes_cache: Dict[str, Quote] = {}
_consumer_started = False


def _start_consumer() -> None:
  global _consumer_started
  if _consumer_started:
    return
  _consumer_started = True
  try:
    from confluent_kafka import Consumer  # type: ignore
  except Exception:
    return

  def _run() -> None:
    consumer: Optional["Consumer"]
    try:
      consumer = Consumer(
        {
          "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
          "group.id": "portfolio-quotes-consumer",
          "auto.offset.reset": "latest",
          "enable.auto.commit": True,
        }
      )
    except Exception:
      return

    try:
      consumer.subscribe([KAFKA_QUOTES_ENRICHED_TOPIC])
      while True:
        msg = consumer.poll(1.0)
        if msg is None:
          continue
        if msg.error():
          continue
        try:
          payload = json.loads(msg.value().decode("utf-8"))
          symbol = str(payload.get("symbol", "")).upper()
          if not symbol:
            continue
          price = float(payload.get("price", 0.0))
          change = float(payload.get("change", 0.0))
          change_rate = float(payload.get("changeRate", 0.0))
          timestamp = float(payload.get("ts", time.time()))
          quote = Quote(
            symbol=symbol,
            price=price,
            change=change,
            change_rate=change_rate,
            timestamp=timestamp,
          )
          with _quotes_lock:
            _quotes_cache[symbol] = quote
        except Exception:
          continue
    finally:
      consumer.close()

  thread = threading.Thread(target=_run, name="quotes-consumer", daemon=True)
  thread.start()


class KafkaMarketDataProvider(IMarketDataProvider):
  def __init__(self) -> None:
    _start_consumer()

  def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
    requested = {str(s).upper() for s in symbols if str(s).strip()}
    if not requested:
      return {}
    with _quotes_lock:
      return {s: q for s, q in _quotes_cache.items() if s in requested}

