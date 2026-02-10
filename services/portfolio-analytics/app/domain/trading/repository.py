from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.trading.entities import Order, Trade


class IOrderRepository(ABC):
    @abstractmethod
    async def get_by_id(self, order_id: UUID) -> Optional[Order]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Order]:
        pass

    @abstractmethod
    async def add(self, order: Order) -> Order:
        pass

    @abstractmethod
    async def save(self, order: Order) -> Optional[Order]:
        pass

    @abstractmethod
    async def remove(self, order_id: UUID) -> bool:
        pass


class ITradeRepository(ABC):
    @abstractmethod
    async def get_by_id(self, trade_id: UUID) -> Optional[Trade]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Trade]:
        pass

    @abstractmethod
    async def add(self, trade: Trade) -> Trade:
        pass

    @abstractmethod
    async def save(self, trade: Trade) -> Optional[Trade]:
        pass

    @abstractmethod
    async def remove(self, trade_id: UUID) -> bool:
        pass
