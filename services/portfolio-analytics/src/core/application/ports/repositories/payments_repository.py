from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.core.domain.entities.payments import CashTransaction, Payment, Settlement


class ICashTransactionRepository(ABC):
    @abstractmethod
    async def get_by_id(self, transaction_id: UUID) -> Optional[CashTransaction]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[CashTransaction]:
        pass

    @abstractmethod
    async def add(self, transaction: CashTransaction) -> CashTransaction:
        pass

    @abstractmethod
    async def save(self, transaction: CashTransaction) -> Optional[CashTransaction]:
        pass

    @abstractmethod
    async def remove(self, transaction_id: UUID) -> bool:
        pass


class IPaymentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, payment_id: UUID) -> Optional[Payment]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Payment]:
        pass

    @abstractmethod
    async def add(self, payment: Payment) -> Payment:
        pass

    @abstractmethod
    async def save(self, payment: Payment) -> Optional[Payment]:
        pass

    @abstractmethod
    async def remove(self, payment_id: UUID) -> bool:
        pass


class ISettlementRepository(ABC):
    @abstractmethod
    async def get_by_id(self, settlement_id: UUID) -> Optional[Settlement]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Settlement]:
        pass

    @abstractmethod
    async def add(self, settlement: Settlement) -> Settlement:
        pass

    @abstractmethod
    async def save(self, settlement: Settlement) -> Optional[Settlement]:
        pass

    @abstractmethod
    async def remove(self, settlement_id: UUID) -> bool:
        pass
