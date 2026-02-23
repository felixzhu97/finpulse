from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.core.domain.entities.market_data import MarketData


class IMarketDataRepository(ABC):
    @abstractmethod
    async def get_by_id(self, data_id: UUID) -> Optional[MarketData]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[MarketData]:
        pass

    @abstractmethod
    async def add(self, data: MarketData) -> MarketData:
        pass

    @abstractmethod
    async def save(self, data: MarketData) -> Optional[MarketData]:
        pass

    @abstractmethod
    async def remove(self, data_id: UUID) -> bool:
        pass
