from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.portfolio.entities import Portfolio, PortfolioSchema, Position
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


class IPortfolioSchemaRepository(ABC):
    @abstractmethod
    async def get_by_id(self, portfolio_id: UUID) -> Optional[PortfolioSchema]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[PortfolioSchema]:
        pass

    @abstractmethod
    async def add(self, portfolio: PortfolioSchema) -> PortfolioSchema:
        pass

    @abstractmethod
    async def save(self, portfolio: PortfolioSchema) -> Optional[PortfolioSchema]:
        pass

    @abstractmethod
    async def remove(self, portfolio_id: UUID) -> bool:
        pass


class IPositionRepository(ABC):
    @abstractmethod
    async def get_by_id(self, position_id: UUID) -> Optional[Position]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Position]:
        pass

    @abstractmethod
    async def add(self, position: Position) -> Position:
        pass

    @abstractmethod
    async def save(self, position: Position) -> Optional[Position]:
        pass

    @abstractmethod
    async def remove(self, position_id: UUID) -> bool:
        pass
