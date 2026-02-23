import json
import time
from typing import Dict, Tuple

from src.infrastructure.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_QUOTES_ENRICHED_TOPIC


class KafkaQuoteProducer:
    def __init__(self) -> None:
        self._producer = None
        try:
            from confluent_kafka import Producer
            self._producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS})
        except Exception:
            pass

    def is_available(self) -> bool:
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
