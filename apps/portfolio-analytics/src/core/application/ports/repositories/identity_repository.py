from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.core.domain.entities.identity import Customer, UserPreference


class ICustomerRepository(ABC):
    @abstractmethod
    async def get_by_id(self, customer_id: UUID) -> Optional[Customer]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Customer]:
        pass

    @abstractmethod
    async def add(self, customer: Customer) -> Customer:
        pass

    @abstractmethod
    async def save(self, customer: Customer) -> Optional[Customer]:
        pass

    @abstractmethod
    async def remove(self, customer_id: UUID) -> bool:
        pass


class IUserPreferenceRepository(ABC):
    @abstractmethod
    async def get_by_id(self, preference_id: UUID) -> Optional[UserPreference]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[UserPreference]:
        pass

    @abstractmethod
    async def add(self, preference: UserPreference) -> UserPreference:
        pass

    @abstractmethod
    async def save(self, preference: UserPreference) -> Optional[UserPreference]:
        pass

    @abstractmethod
    async def remove(self, preference_id: UUID) -> bool:
        pass
