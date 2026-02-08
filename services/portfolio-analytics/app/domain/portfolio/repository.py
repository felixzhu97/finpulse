from abc import ABC, abstractmethod
from typing import Optional

from app.domain.portfolio.entities import Portfolio


class IPortfolioRepository(ABC):
  @abstractmethod
  def get(self, portfolio_id: str) -> Optional[Portfolio]:
    pass

  @abstractmethod
  def save(self, portfolio_id: str, data: dict) -> None:
    pass
