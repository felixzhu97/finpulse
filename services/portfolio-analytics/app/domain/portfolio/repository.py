from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.portfolio.entities import Portfolio
from app.domain.portfolio.value_objects import HistoryPoint


class IPortfolioRepository(ABC):
  @abstractmethod
  async def get(self, portfolio_id: str) -> Optional[Portfolio]:
    pass

  @abstractmethod
  async def save(self, portfolio_id: str, data: dict) -> None:
    pass


class IPortfolioHistoryRepository(ABC):
  @abstractmethod
  async def get_range(self, portfolio_id: str, days: int = 30) -> List[HistoryPoint]:
    pass

  @abstractmethod
  async def append(self, portfolio_id: str, points: List[HistoryPoint]) -> None:
    pass
