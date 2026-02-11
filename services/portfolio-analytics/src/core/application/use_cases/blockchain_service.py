from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from src.core.application.ports.repositories.blockchain_repository import (
    IBlockchainLedger,
    IWalletBalanceRepository,
)
from src.core.domain.entities.blockchain import Block, ChainTransaction, WalletBalance


class InsufficientBalanceError(Exception):
    pass


class BlockchainApplicationService:
    def __init__(
        self,
        ledger: IBlockchainLedger,
        wallet_repository: IWalletBalanceRepository,
    ):
        self._ledger = ledger
        self._wallet = wallet_repository

    async def submit_transfer(
        self,
        sender_account_id: UUID,
        receiver_account_id: UUID,
        amount: float,
        currency: str,
    ) -> ChainTransaction:
        if amount <= 0:
            raise ValueError("amount must be positive")
        balance = await self._wallet.get_balance(sender_account_id, currency)
        current = balance.balance if balance else 0.0
        if current < amount:
            raise InsufficientBalanceError(
                f"insufficient balance: {current} {currency}"
            )
        now = datetime.now(timezone.utc)
        tx_id = uuid4()
        latest = await self._ledger.get_latest_block()
        next_index = 0 if latest is None else latest.index + 1
        previous_hash = "0" if latest is None else latest.hash
        tx = ChainTransaction(
            tx_id=tx_id,
            block_index=next_index,
            sender_account_id=sender_account_id,
            receiver_account_id=receiver_account_id,
            amount=amount,
            currency=currency,
            created_at=now,
        )
        block = Block(
            index=next_index,
            timestamp=now,
            previous_hash=previous_hash,
            transaction_ids=(str(tx_id),),
            hash="",
        )
        await self._ledger.append_block(block, [tx])
        await self._wallet.update_balance(sender_account_id, currency, -amount)
        await self._wallet.update_balance(receiver_account_id, currency, amount)
        return tx

    async def get_balance(self, account_id: UUID, currency: str) -> float:
        balance = await self._wallet.get_balance(account_id, currency)
        return balance.balance if balance else 0.0

    async def seed_balance(
        self, account_id: UUID, currency: str, amount: float
    ) -> WalletBalance:
        if amount <= 0:
            raise ValueError("amount must be positive")
        return await self._wallet.update_balance(account_id, currency, amount)

    async def get_chain(self, limit: int = 100, offset: int = 0) -> List[Block]:
        return await self._ledger.list_blocks(limit=limit, offset=offset)

    async def get_block(self, block_index: int) -> Optional[Block]:
        return await self._ledger.get_block_by_index(block_index)

    async def get_block_with_transactions(
        self, block_index: int
    ) -> Optional[tuple[Block, List[ChainTransaction]]]:
        block = await self._ledger.get_block_by_index(block_index)
        if block is None:
            return None
        transactions = await self._ledger.list_transactions_by_block(block_index)
        return block, transactions

    async def get_transaction(self, tx_id: UUID) -> Optional[ChainTransaction]:
        return await self._ledger.get_transaction(tx_id)
