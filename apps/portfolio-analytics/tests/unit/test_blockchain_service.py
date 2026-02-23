import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest

from src.core.application.use_cases.blockchain_service import (
    BlockchainApplicationService,
    InsufficientBalanceError,
)
from src.core.domain.entities.blockchain import WalletBalance


@pytest.fixture
def sender_id():
    return uuid4()


@pytest.fixture
def receiver_id():
    return uuid4()


@pytest.fixture
def mock_ledger():
    class Ledger:
        async def get_latest_block_for_update(self):
            return None

        async def get_latest_block(self):
            return None

        async def append_block(self, block, transactions):
            pass

        async def get_block_by_index(self, i):
            return None

        async def list_blocks(self, limit, offset):
            return []

        async def get_transaction(self, tx_id):
            return None

        async def list_transactions_by_block(self, block_index):
            return []

    return Ledger()


@pytest.fixture
def mock_wallet():
    class Wallet:
        def __init__(self):
            self._balances = {}
            self.get_balance_for_update_called = []
            self.update_balance_called = []

        async def get_balance(self, account_id, currency):
            key = (account_id, currency)
            balance = self._balances.get(key, 0.0)
            return WalletBalance(
                account_id=account_id,
                currency=currency,
                balance=balance,
                updated_at=datetime.now(timezone.utc),
            )

        async def get_balance_for_update(self, account_id, currency):
            self.get_balance_for_update_called.append((account_id, currency))
            balance = self._balances.get((account_id, currency), 0.0)
            return WalletBalance(
                account_id=account_id,
                currency=currency,
                balance=balance,
                updated_at=datetime.now(timezone.utc),
            )

        async def update_balance(self, account_id, currency, delta):
            self.update_balance_called.append((account_id, currency, delta))
            key = (account_id, currency)
            self._balances[key] = self._balances.get(key, 0.0) + delta
            return WalletBalance(
                account_id=account_id,
                currency=currency,
                balance=self._balances[key],
                updated_at=datetime.now(timezone.utc),
            )

    return Wallet()


def test_submit_transfer_locks_in_canonical_order(
    mock_ledger, mock_wallet, sender_id, receiver_id
):
    mock_wallet._balances[(sender_id, "SIM_COIN")] = 50.0
    service = BlockchainApplicationService(mock_ledger, mock_wallet)

    async def run():
        await service.submit_transfer(sender_id, receiver_id, 10.0, "SIM_COIN")

    asyncio.run(run())
    first, second = min(sender_id, receiver_id), max(sender_id, receiver_id)
    assert mock_wallet.get_balance_for_update_called[0] == (first, "SIM_COIN")
    assert mock_wallet.get_balance_for_update_called[1] == (second, "SIM_COIN")


def test_submit_transfer_insufficient_balance_raises(
    mock_ledger, mock_wallet, sender_id, receiver_id
):
    mock_wallet._balances[(sender_id, "SIM_COIN")] = 5.0
    service = BlockchainApplicationService(mock_ledger, mock_wallet)

    async def run():
        await service.submit_transfer(sender_id, receiver_id, 10.0, "SIM_COIN")

    with pytest.raises(InsufficientBalanceError):
        asyncio.run(run())


def test_submit_transfer_invalid_amount_raises(
    mock_ledger, mock_wallet, sender_id, receiver_id
):
    mock_wallet._balances[(sender_id, "SIM_COIN")] = 100.0
    service = BlockchainApplicationService(mock_ledger, mock_wallet)

    async def run_zero():
        await service.submit_transfer(sender_id, receiver_id, 0.0, "SIM_COIN")

    async def run_negative():
        await service.submit_transfer(sender_id, receiver_id, -1.0, "SIM_COIN")

    with pytest.raises(ValueError):
        asyncio.run(run_zero())
    with pytest.raises(ValueError):
        asyncio.run(run_negative())


def test_submit_transfer_success_updates_balances(
    mock_ledger, mock_wallet, sender_id, receiver_id
):
    mock_wallet._balances[(sender_id, "SIM_COIN")] = 100.0
    service = BlockchainApplicationService(mock_ledger, mock_wallet)

    async def run():
        return await service.submit_transfer(
            sender_id, receiver_id, 30.0, "SIM_COIN"
        )

    tx = asyncio.run(run())
    assert tx.amount == 30.0
    assert tx.sender_account_id == sender_id
    assert tx.receiver_account_id == receiver_id
    updates = mock_wallet.update_balance_called
    assert (sender_id, "SIM_COIN", -30.0) in updates
    assert (receiver_id, "SIM_COIN", 30.0) in updates
