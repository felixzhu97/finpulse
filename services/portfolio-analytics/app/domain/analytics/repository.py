from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.analytics.entities import RiskMetrics, Valuation


class IRiskMetricsRepository(ABC):
    @abstractmethod
    async def get_by_id(self, metric_id: UUID) -> Optional[RiskMetrics]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[RiskMetrics]:
        pass

    @abstractmethod
    async def add(self, metrics: RiskMetrics) -> RiskMetrics:
        pass

    @abstractmethod
    async def save(self, metrics: RiskMetrics) -> Optional[RiskMetrics]:
        pass

    @abstractmethod
    async def remove(self, metric_id: UUID) -> bool:
        pass


class IValuationRepository(ABC):
    @abstractmethod
    async def get_by_id(self, valuation_id: UUID) -> Optional[Valuation]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Valuation]:
        pass

    @abstractmethod
    async def add(self, valuation: Valuation) -> Valuation:
        pass

    @abstractmethod
    async def save(self, valuation: Valuation) -> Optional[Valuation]:
        pass

    @abstractmethod
    async def remove(self, valuation_id: UUID) -> bool:
        pass
