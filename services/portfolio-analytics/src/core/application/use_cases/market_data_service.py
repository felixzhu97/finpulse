from __future__ import annotations

from typing import Dict, Iterable

from src.core.application.ports.services.market_data_provider import IMarketDataProvider
from src.core.domain.entities.market_data import Quote


class MarketDataService:
    def __init__(self, provider: IMarketDataProvider):
        self._provider = provider

    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        return self._provider.get_quotes(symbols)

