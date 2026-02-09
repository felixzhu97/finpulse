from abc import ABC, abstractmethod
from typing import Dict, Iterable

from app.domain.market_data.entities import Quote


class IMarketDataProvider(ABC):
  @abstractmethod
  def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
    raise NotImplementedError

