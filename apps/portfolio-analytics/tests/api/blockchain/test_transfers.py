from uuid import uuid4

import pytest

from tests.support import ApiPaths, get_two_account_ids_async, run_concurrent_async


async def test_transfer_success(blockchain_client) -> None:
    sender_id, receiver_id = await get_two_account_ids_async(blockchain_client)
    if not sender_id or not receiver_id:
        pytest.skip("need two accounts")
    r_s0 = await blockchain_client.get(
        ApiPaths.blockchain_balances(sender_id, "SIM_COIN")
    )
    r_r0 = await blockchain_client.get(
        ApiPaths.blockchain_balances(receiver_id, "SIM_COIN")
    )
    assert r_s0.status_code == 200 and r_r0.status_code == 200
    sender_before = r_s0.json()["balance"]
    receiver_before = r_r0.json()["balance"]
    await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_SEED_BALANCE,
        json={"account_id": sender_id, "currency": "SIM_COIN", "amount": 200.0},
    )
    r = await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_TRANSFERS,
        json={
            "sender_account_id": sender_id,
            "receiver_account_id": receiver_id,
            "amount": 50.0,
            "currency": "SIM_COIN",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["amount"] == 50.0
    assert data["sender_account_id"] == sender_id
    assert data["receiver_account_id"] == receiver_id
    r_sender = await blockchain_client.get(
        ApiPaths.blockchain_balances(sender_id, "SIM_COIN")
    )
    r_receiver = await blockchain_client.get(
        ApiPaths.blockchain_balances(receiver_id, "SIM_COIN")
    )
    assert r_sender.status_code == 200 and r_receiver.status_code == 200
    assert r_sender.json()["balance"] == sender_before + 200.0 - 50.0
    assert r_receiver.json()["balance"] == receiver_before + 50.0


async def test_transfer_insufficient_balance_returns_400(
    blockchain_client,
) -> None:
    account_id, _ = await get_two_account_ids_async(blockchain_client)
    if not account_id:
        pytest.skip("need at least one account")
    r = await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_TRANSFERS,
        json={
            "sender_account_id": account_id,
            "receiver_account_id": str(uuid4()),
            "amount": 1e9,
            "currency": "SIM_COIN",
        },
    )
    assert r.status_code in (400, 422, 404)


async def test_transfer_invalid_payload_returns_422(
    blockchain_client,
) -> None:
    r = await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_TRANSFERS,
        json={
            "sender_account_id": "not-a-uuid",
            "receiver_account_id": str(uuid4()),
            "amount": 10.0,
            "currency": "SIM_COIN",
        },
    )
    assert r.status_code == 422


async def test_concurrent_transfers_preserve_balance(
    blockchain_client,
) -> None:
    sender_id, receiver_id = await get_two_account_ids_async(blockchain_client)
    if not sender_id or not receiver_id:
        pytest.skip("need two accounts")
    r_s0 = await blockchain_client.get(
        ApiPaths.blockchain_balances(sender_id, "SIM_COIN")
    )
    r_r0 = await blockchain_client.get(
        ApiPaths.blockchain_balances(receiver_id, "SIM_COIN")
    )
    assert r_s0.status_code == 200 and r_r0.status_code == 200
    sender_before = r_s0.json()["balance"]
    receiver_before = r_r0.json()["balance"]
    await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_SEED_BALANCE,
        json={"account_id": sender_id, "currency": "SIM_COIN", "amount": 100.0},
    )
    total_per_tx = 10.0
    concurrency = 10

    async def do_transfer(_: int):
        return await blockchain_client.post(
            ApiPaths.BLOCKCHAIN_TRANSFERS,
            json={
                "sender_account_id": sender_id,
                "receiver_account_id": receiver_id,
                "amount": total_per_tx,
                "currency": "SIM_COIN",
            },
        )

    results = await run_concurrent_async(do_transfer, concurrency)
    success_count = sum(1 for r in results if r.status_code == 201)
    assert success_count == concurrency
    r_sender = await blockchain_client.get(
        ApiPaths.blockchain_balances(sender_id, "SIM_COIN")
    )
    r_receiver = await blockchain_client.get(
        ApiPaths.blockchain_balances(receiver_id, "SIM_COIN")
    )
    assert r_sender.status_code == 200 and r_receiver.status_code == 200
    assert r_sender.json()["balance"] == sender_before + 100.0 - total_per_tx * concurrency
    assert r_receiver.json()["balance"] == receiver_before + total_per_tx * concurrency
