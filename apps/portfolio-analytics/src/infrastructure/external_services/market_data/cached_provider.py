from typing import Dict, Iterable, Optional

from src.core.application.ports.services.market_data_provider import IMarketDataProvider
from src.core.domain.entities.market_data import Quote
from src.infrastructure.cache.quote_cache import QuoteCache
from src.infrastructure.external_services.market_data.database_provider import DatabaseMarketDataProvider


class CachedMarketDataProvider(IMarketDataProvider):
    def __init__(
        self,
        cache: Optional[QuoteCache] = None,
        inner: Optional[DatabaseMarketDataProvider] = None,
    ) -> None:
        self._cache = cache or QuoteCache()
        self._inner = inner or DatabaseMarketDataProvider()

    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        requested = list({str(s).strip().upper() for s in symbols if str(s).strip()})
        if not requested:
            return {}
        cached = self._cache.get_quotes(requested)
        misses = [s for s in requested if s not in cached]
        if not misses:
            return cached
        from_db = self._inner.get_quotes(misses)
        if from_db:
            self._cache.set_quotes(from_db)
        result = dict(cached)
        result.update(from_db)
        return result
