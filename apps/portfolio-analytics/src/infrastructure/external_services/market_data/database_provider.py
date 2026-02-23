from typing import Dict, Iterable, Optional

from src.core.application.ports.repositories.realtime_quote_repository import IRealtimeQuoteRepository
from src.core.application.ports.services.market_data_provider import IMarketDataProvider
from src.core.domain.entities.market_data import Quote
from src.infrastructure.database.repositories.realtime_quote_repository import RealtimeQuoteRepository


class DatabaseMarketDataProvider(IMarketDataProvider):
    def __init__(self, repository: Optional[IRealtimeQuoteRepository] = None) -> None:
        self._repo = repository or RealtimeQuoteRepository()

    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        return self._repo.get_quotes(symbols)
