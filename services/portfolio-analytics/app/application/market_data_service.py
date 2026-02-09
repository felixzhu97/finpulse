from typing import Dict, Iterable

from app.domain.market_data import IMarketDataProvider, Quote


class MarketDataService:
  def __init__(self, provider: IMarketDataProvider):
    self._provider = provider

  def get_quotes(self, symbols: Iterable[str]) -> Dict[str, Quote]:
    return self._provider.get_quotes(symbols)

