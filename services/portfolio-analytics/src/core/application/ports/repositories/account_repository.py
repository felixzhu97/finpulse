from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.core.domain.entities.account import Account


class IAccountRepository(ABC):
    @abstractmethod
    async def get_by_id(self, account_id: UUID) -> Optional[Account]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Account]:
        pass

    @abstractmethod
    async def add(self, account: Account) -> Account:
        pass

    @abstractmethod
    async def save(self, account: Account) -> Optional[Account]:
        pass

    @abstractmethod
    async def remove(self, account_id: UUID) -> bool:
        pass
