from abc import ABC, abstractmethod
from typing import Dict, Iterable, Tuple

from src.core.domain.entities.market_data import Quote


class IRealtimeQuoteRepository(ABC):
    @abstractmethod
    def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
        raise NotImplementedError

    @abstractmethod
    def get_quote_history(self, symbols: Iterable[str], minutes: int = 5) -> Dict[str, list]:
        raise NotImplementedError

    @abstractmethod
    def upsert_quotes(self, quotes: Dict[str, Tuple[float, float, float]]) -> None:
        raise NotImplementedError

    @abstractmethod
    def insert_ticks(self, quotes: Dict[str, Tuple[float, float, float]]) -> None:
        raise NotImplementedError
