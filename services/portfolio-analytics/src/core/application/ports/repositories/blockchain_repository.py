from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.core.domain.entities.blockchain import Block, ChainTransaction, WalletBalance


class IBlockchainLedger(ABC):
    @abstractmethod
    async def append_block(self, block: Block, transactions: List[ChainTransaction]) -> None:
        pass

    @abstractmethod
    async def get_block_by_index(self, block_index: int) -> Optional[Block]:
        pass

    @abstractmethod
    async def get_latest_block(self) -> Optional[Block]:
        pass

    @abstractmethod
    async def list_blocks(self, limit: int, offset: int) -> List[Block]:
        pass

    @abstractmethod
    async def get_transaction(self, tx_id: UUID) -> Optional[ChainTransaction]:
        pass

    @abstractmethod
    async def list_transactions_by_block(self, block_index: int) -> List[ChainTransaction]:
        pass


class IWalletBalanceRepository(ABC):
    @abstractmethod
    async def get_balance(self, account_id: UUID, currency: str) -> Optional[WalletBalance]:
        pass

    @abstractmethod
    async def update_balance(self, account_id: UUID, currency: str, delta: float) -> WalletBalance:
        pass
