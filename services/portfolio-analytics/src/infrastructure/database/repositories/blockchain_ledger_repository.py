from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.application.ports.repositories.blockchain_repository import IBlockchainLedger
from src.core.domain.entities.blockchain import Block, ChainTransaction
from src.infrastructure.database.block_hasher import compute_block_hash
from src.infrastructure.database.models import BlockRow, ChainTransactionRow
from src.infrastructure.database.repositories.persistence_mappers import (
    block_row_to_entity,
    chain_transaction_row_to_entity,
)


class BlockchainLedgerRepository(IBlockchainLedger):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def append_block(self, block: Block, transactions: List[ChainTransaction]) -> None:
        block_hash = block.hash
        if not block_hash:
            block_hash = compute_block_hash(
                block.index,
                block.timestamp,
                block.previous_hash,
                block.transaction_ids,
            )
        row = BlockRow(
            block_index=block.index,
            timestamp=block.timestamp,
            previous_hash=block.previous_hash,
            hash=block_hash,
        )
        self._session.add(row)
        for tx in transactions:
            tx_row = ChainTransactionRow(
                tx_id=tx.tx_id,
                block_index=tx.block_index,
                sender_account_id=tx.sender_account_id,
                receiver_account_id=tx.receiver_account_id,
                amount=tx.amount,
                currency=tx.currency,
                created_at=tx.created_at,
            )
            self._session.add(tx_row)
        await self._session.flush()

    async def get_block_by_index(self, block_index: int) -> Optional[Block]:
        result = await self._session.execute(
            select(BlockRow).where(BlockRow.block_index == block_index)
        )
        row = result.scalar_one_or_none()
        if row is None:
            return None
        tx_result = await self._session.execute(
            select(ChainTransactionRow).where(
                ChainTransactionRow.block_index == block_index
            )
        )
        tx_rows = tx_result.scalars().all()
        tx_ids = tuple(str(r.tx_id) for r in tx_rows)
        return block_row_to_entity(row, transaction_ids=tx_ids)

    async def get_latest_block(self) -> Optional[Block]:
        result = await self._session.execute(
            select(BlockRow).order_by(BlockRow.block_index.desc()).limit(1)
        )
        row = result.scalar_one_or_none()
        if row is None:
            return None
        tx_result = await self._session.execute(
            select(ChainTransactionRow).where(
                ChainTransactionRow.block_index == row.block_index
            )
        )
        tx_rows = tx_result.scalars().all()
        tx_ids = tuple(str(r.tx_id) for r in tx_rows)
        return block_row_to_entity(row, transaction_ids=tx_ids)

    async def list_blocks(self, limit: int = 100, offset: int = 0) -> List[Block]:
        result = await self._session.execute(
            select(BlockRow).order_by(BlockRow.block_index.asc()).limit(limit).offset(offset)
        )
        rows = result.scalars().all()
        if not rows:
            return []
        indices = [r.block_index for r in rows]
        tx_result = await self._session.execute(
            select(ChainTransactionRow).where(
                ChainTransactionRow.block_index.in_(indices)
            )
        )
        tx_rows = tx_result.scalars().all()
        by_block: dict[int, list[str]] = {}
        for r in tx_rows:
            by_block.setdefault(r.block_index, []).append(str(r.tx_id))
        return [
            block_row_to_entity(
                r,
                transaction_ids=tuple(by_block.get(r.block_index, [])),
            )
            for r in rows
        ]

    async def get_transaction(self, tx_id: UUID) -> Optional[ChainTransaction]:
        result = await self._session.execute(
            select(ChainTransactionRow).where(ChainTransactionRow.tx_id == tx_id)
        )
        row = result.scalar_one_or_none()
        return chain_transaction_row_to_entity(row) if row else None

    async def list_transactions_by_block(self, block_index: int) -> List[ChainTransaction]:
        result = await self._session.execute(
            select(ChainTransactionRow).where(
                ChainTransactionRow.block_index == block_index
            )
        )
        rows = result.scalars().all()
        return [chain_transaction_row_to_entity(r) for r in rows]
