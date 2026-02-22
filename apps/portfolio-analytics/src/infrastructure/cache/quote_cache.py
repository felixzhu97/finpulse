import json
import time
from typing import Dict, Iterable, Optional

from src.core.domain.entities.market_data import Quote
from src.infrastructure.config import REDIS_URL

QUOTES_KEY_PREFIX = "quotes:"
QUOTES_TTL_SECONDS = 60


class QuoteCache:
    def __init__(self) -> None:
        self._client = None
        try:
            import redis
            self._client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        except Exception:
            pass

    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        if not self._client:
            return {}
        requested = [str(s).strip().upper() for s in symbols if str(s).strip()]
        if not requested:
            return {}
        result: Dict[str, Quote] = {}
        keys = [f"{QUOTES_KEY_PREFIX}{s}" for s in requested]
        raw_list = self._client.mget(keys)
        for symbol, raw in zip(requested, raw_list):
            if not raw:
                continue
            try:
                data = json.loads(raw)
                result[symbol] = Quote(
                    symbol=symbol,
                    price=float(data.get("price", 0)),
                    change=float(data.get("change", 0)),
                    change_rate=float(data.get("change_rate", 0)),
                    timestamp=float(data.get("timestamp", time.time())),
                )
            except (json.JSONDecodeError, TypeError, KeyError):
                pass
        return result

    def set_quotes(self, quotes: Dict[str, Quote]) -> None:
        if not self._client or not quotes:
            return
        pipe = self._client.pipeline()
        for symbol, q in quotes.items():
            key = f"{QUOTES_KEY_PREFIX}{symbol}"
            val = json.dumps({
                "price": q.price,
                "change": q.change,
                "change_rate": q.change_rate,
                "timestamp": q.timestamp,
            })
            pipe.setex(key, QUOTES_TTL_SECONDS, val)
        try:
            pipe.execute()
        except Exception:
            pass
