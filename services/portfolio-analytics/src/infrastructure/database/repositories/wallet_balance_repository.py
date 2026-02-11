from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.application.ports.repositories.blockchain_repository import IWalletBalanceRepository
from src.core.domain.entities.blockchain import WalletBalance
from src.infrastructure.database.models import WalletBalanceRow
from src.infrastructure.database.repositories.persistence_mappers import (
    wallet_balance_row_to_entity,
)


class WalletBalanceRepository(IWalletBalanceRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_balance(self, account_id: UUID, currency: str) -> Optional[WalletBalance]:
        result = await self._session.execute(
            select(WalletBalanceRow).where(
                WalletBalanceRow.account_id == account_id,
                WalletBalanceRow.currency == currency,
            )
        )
        row = result.scalar_one_or_none()
        return wallet_balance_row_to_entity(row) if row else None

    async def update_balance(
        self, account_id: UUID, currency: str, delta: float
    ) -> WalletBalance:
        result = await self._session.execute(
            select(WalletBalanceRow).where(
                WalletBalanceRow.account_id == account_id,
                WalletBalanceRow.currency == currency,
            )
        )
        row = result.scalar_one_or_none()
        now = datetime.now(timezone.utc)
        if row is None:
            row = WalletBalanceRow(
                account_id=account_id,
                currency=currency,
                balance=delta,
                updated_at=now,
            )
            self._session.add(row)
        else:
            row.balance = float(row.balance) + delta
            row.updated_at = now
        await self._session.flush()
        await self._session.refresh(row)
        return wallet_balance_row_to_entity(row)
