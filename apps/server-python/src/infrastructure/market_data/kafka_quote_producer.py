import json
import logging
import threading
import time
from typing import Dict, Optional, Tuple

from src.infrastructure.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_QUOTES_ENRICHED_TOPIC

logger = logging.getLogger(__name__)


class KafkaQuoteProducer:
    def __init__(self) -> None:
        self._producer = None
        self._lock = threading.Lock()
        self._init_started = False

    def _lazy_connect(self) -> None:
        with self._lock:
            if self._init_started or self._producer is not None:
                return
            self._init_started = True
        try:
            from confluent_kafka import Producer
            p = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS, "message.timeout.ms": 3000})
            with self._lock:
                self._producer = p
        except Exception as e:
            logger.debug("Kafka producer init skipped: %s", e)

    def is_available(self) -> bool:
        if self._producer is None and not self._init_started:
            t = threading.Thread(target=self._lazy_connect, daemon=True)
            t.start()
        return self._producer is not None

    def publish_quotes(self, quotes: Dict[str, Tuple[float, float, float, float]]) -> bool:
        if not self._producer or not quotes:
            return False
        try:
            ts = time.time()
            for symbol, (price, change, change_rate, volume) in quotes.items():
                payload = {
                    "symbol": symbol,
                    "price": price,
                    "change": change,
                    "changeRate": change_rate,
                    "volume": volume,
                    "ts": ts,
                }
                self._producer.produce(
                    KAFKA_QUOTES_ENRICHED_TOPIC,
                    key=symbol.encode("utf-8"),
                    value=json.dumps(payload).encode("utf-8"),
                )
            self._producer.flush(1.0)
            return True
        except Exception:
            return False
