from typing import List, Optional
from uuid import UUID, uuid4

from app.domain.payments import ISettlementRepository, Settlement


class SettlementApplicationService:
    def __init__(self, repository: ISettlementRepository):
        self._repo = repository

    async def list_settlements(self, limit: int = 100, offset: int = 0) -> List[Settlement]:
        return await self._repo.list(limit=limit, offset=offset)

    async def get_settlement(self, settlement_id: UUID) -> Optional[Settlement]:
        return await self._repo.get_by_id(settlement_id)

    async def create_settlement(
        self,
        trade_id: UUID,
        payment_id: UUID,
        status: str = "pending",
        settled_at: Optional[object] = None,
    ) -> Settlement:
        settlement = Settlement(
            settlement_id=uuid4(),
            trade_id=trade_id,
            payment_id=payment_id,
            status=status,
            settled_at=settled_at,
        )
        return await self._repo.add(settlement)

    async def update_settlement(
        self,
        settlement_id: UUID,
        trade_id: UUID,
        payment_id: UUID,
        status: str,
        settled_at: Optional[object] = None,
    ) -> Optional[Settlement]:
        existing = await self._repo.get_by_id(settlement_id)
        if not existing:
            return None
        updated = Settlement(
            settlement_id=settlement_id,
            trade_id=trade_id,
            payment_id=payment_id,
            status=status,
            settled_at=settled_at,
        )
        return await self._repo.save(updated)

    async def remove_settlement(self, settlement_id: UUID) -> bool:
        return await self._repo.remove(settlement_id)
