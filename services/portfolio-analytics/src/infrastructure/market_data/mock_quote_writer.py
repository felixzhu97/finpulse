import random
import threading
from typing import Optional

from src.infrastructure.database.repositories.realtime_quote_repository import RealtimeQuoteRepository
from src.infrastructure.market_data.kafka_quote_producer import KafkaQuoteProducer
from src.infrastructure.market_data.nasdaq_symbols import NASDAQ_200_SYMBOLS, initial_prices

DEFAULT_SYMBOLS = NASDAQ_200_SYMBOLS
DEFAULT_INITIAL_PRICES = initial_prices()


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
        quotes: dict[str, tuple[float, float, float, float]] = {}
        for symbol in self._symbols:
            last = self._state.get(symbol, 100.0)
            delta = random.uniform(-0.5, 0.5)
            price = max(1.0, last + delta)
            change = price - last
            change_rate = change / last if last else 0.0
            volume = random.randint(100000, 5000000)
            self._state[symbol] = price
            quotes[symbol] = (round(price, 2), round(change, 2), round(change_rate, 4), float(volume))
        if self._producer.is_available():
            self._producer.publish_quotes(quotes)
        repo_quotes = {s: (p, c, cr) for s, (p, c, cr, _) in quotes.items()}
        self._repo.upsert_quotes(repo_quotes)
        try:
            self._repo.insert_ticks(repo_quotes)
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
