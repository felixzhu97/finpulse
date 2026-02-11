import random
import threading
from typing import Optional

from src.infrastructure.database.repositories.realtime_quote_repository import RealtimeQuoteRepository
from src.infrastructure.market_data.kafka_quote_producer import KafkaQuoteProducer


DEFAULT_SYMBOLS = [
    "AAPL", "TSLA", "GOOG", "GOOGL", "META", "MSFT", "AMZN",
    "BRK.B", "JPM", "SPY", "NVDA",
    "9988.HK", "0700.HK", "3690.HK", "1810.HK",
]

DEFAULT_INITIAL_PRICES = {
    "AAPL": 234.38,
    "TSLA": 419.29,
    "GOOG": 325.71,
    "GOOGL": 175.40,
    "META": 603.52,
    "MSFT": 411.71,
    "AMZN": 200.99,
    "BRK.B": 415.00,
    "JPM": 218.50,
    "SPY": 585.00,
    "NVDA": 875.28,
    "9988.HK": 157.90,
    "0700.HK": 560.00,
    "3690.HK": 91.05,
    "1810.HK": 35.20,
}


class MockQuoteWriter:
    def __init__(
        self,
        repository: Optional[RealtimeQuoteRepository] = None,
        producer: Optional[KafkaQuoteProducer] = None,
        symbols: Optional[list] = None,
        interval_seconds: float = 1.0,
    ) -> None:
        self._repo = repository or RealtimeQuoteRepository()
        self._producer = producer or KafkaQuoteProducer()
        self._symbols = symbols or DEFAULT_SYMBOLS
        self._interval = interval_seconds
        self._state = dict(DEFAULT_INITIAL_PRICES)
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()

    def _tick(self) -> None:
        quotes: dict[str, tuple[float, float, float]] = {}
        for symbol in self._symbols:
            last = self._state.get(symbol, 100.0)
            delta = random.uniform(-0.5, 0.5)
            price = max(1.0, last + delta)
            change = price - last
            change_rate = change / last if last else 0.0
            self._state[symbol] = price
            quotes[symbol] = (round(price, 2), round(change, 2), round(change_rate, 4))
        if self._producer.is_available():
            self._producer.publish_quotes(quotes)
        self._repo.upsert_quotes(quotes)
        try:
            self._repo.insert_ticks(quotes)
        except Exception:
            pass

    def _run(self) -> None:
        while not self._stop.wait(self._interval):
            try:
                self._tick()
            except Exception:
                pass

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="mock-quote-writer", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
