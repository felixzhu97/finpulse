from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, Iterable

from src.core.domain.entities.market_data import Quote


class IMarketDataProvider(ABC):
    @abstractmethod
    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        raise NotImplementedError
