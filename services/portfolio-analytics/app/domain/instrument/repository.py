from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.instrument.entities import Bond, Instrument, Option


class IInstrumentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, instrument_id: UUID) -> Optional[Instrument]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Instrument]:
        pass

    @abstractmethod
    async def add(self, instrument: Instrument) -> Instrument:
        pass

    @abstractmethod
    async def save(self, instrument: Instrument) -> Optional[Instrument]:
        pass

    @abstractmethod
    async def remove(self, instrument_id: UUID) -> bool:
        pass


class IBondRepository(ABC):
    @abstractmethod
    async def get_by_id(self, bond_id: UUID) -> Optional[Bond]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Bond]:
        pass

    @abstractmethod
    async def add(self, bond: Bond) -> Bond:
        pass

    @abstractmethod
    async def save(self, bond: Bond) -> Optional[Bond]:
        pass

    @abstractmethod
    async def remove(self, bond_id: UUID) -> bool:
        pass


class IOptionRepository(ABC):
    @abstractmethod
    async def get_by_id(self, option_id: UUID) -> Optional[Option]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Option]:
        pass

    @abstractmethod
    async def add(self, option: Option) -> Option:
        pass

    @abstractmethod
    async def save(self, option: Option) -> Optional[Option]:
        pass

    @abstractmethod
    async def remove(self, option_id: UUID) -> bool:
        pass
