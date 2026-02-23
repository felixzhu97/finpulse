import json
import threading
import time
from typing import Callable, Optional

from src.infrastructure.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_QUOTES_ENRICHED_TOPIC


QuoteBatchHandler = Callable[[dict], None]


class KafkaQuoteConsumer:
    def __init__(self, on_batch: QuoteBatchHandler) -> None:
        self._on_batch = on_batch
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()

    def _run(self) -> None:
        try:
            from confluent_kafka import Consumer
        except Exception:
            return
        try:
            consumer = Consumer(
                {
                    "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
                    "group.id": "portfolio-quotes-sink",
                    "auto.offset.reset": "latest",
                    "enable.auto.commit": True,
                }
            )
            consumer.subscribe([KAFKA_QUOTES_ENRICHED_TOPIC])
        except Exception:
            return
        batch: dict = {}
        last_flush = time.time()
        try:
            while not self._stop.wait(0.1):
                msg = consumer.poll(0.5)
                if msg is None:
                    if batch and (time.time() - last_flush) > 0.5:
                        self._flush_batch(batch)
                        batch = {}
                        last_flush = time.time()
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
                    batch[symbol] = (price, change, change_rate)
                except Exception:
                    continue
        finally:
            if batch:
                self._flush_batch(batch)
            consumer.close()

    def _flush_batch(self, batch: dict) -> None:
        try:
            self._on_batch(batch)
        except Exception:
            pass

    def start(self) -> bool:
        try:
            from confluent_kafka import Consumer
            Consumer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS})
        except Exception:
            return False
        if self._thread and self._thread.is_alive():
            return True
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="kafka-quote-consumer", daemon=True)
        self._thread.start()
        return True

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=3.0)
            self._thread = None
