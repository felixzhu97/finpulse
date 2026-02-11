import pytest

from tests.support import ApiPaths, get_two_account_ids_async, run_concurrent_async


async def test_get_balance_no_seed_returns_zero(blockchain_client) -> None:
    account_id, _ = await get_two_account_ids_async(blockchain_client)
    if not account_id:
        pytest.skip("need at least one account")
    r = await blockchain_client.get(
        ApiPaths.blockchain_balances(account_id, "SIM_COIN")
    )
    assert r.status_code == 200
    data = r.json()
    assert "balance" in data
    assert isinstance(data["balance"], (int, float))


async def test_seed_balance_and_balances(blockchain_client) -> None:
    account_id, _ = await get_two_account_ids_async(blockchain_client)
    if not account_id:
        pytest.skip("need at least one account")
    r_before = await blockchain_client.get(
        ApiPaths.blockchain_balances(account_id, "SIM_COIN")
    )
    assert r_before.status_code == 200
    before = r_before.json()["balance"]
    r = await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_SEED_BALANCE,
        json={"account_id": account_id, "currency": "SIM_COIN", "amount": 100.0},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["account_id"] == account_id
    assert data["currency"] == "SIM_COIN"
    assert data["balance"] == before + 100.0
    r2 = await blockchain_client.get(
        ApiPaths.blockchain_balances(account_id, "SIM_COIN")
    )
    assert r2.status_code == 200
    assert r2.json()["balance"] == before + 100.0


async def test_concurrent_seed_balance_same_account(
    blockchain_client,
) -> None:
    account_id, _ = await get_two_account_ids_async(blockchain_client)
    if not account_id:
        pytest.skip("need at least one account")
    r_before = await blockchain_client.get(
        ApiPaths.blockchain_balances(account_id, "SIM_COIN")
    )
    assert r_before.status_code == 200
    before = r_before.json()["balance"]
    amount_per_seed = 10.0
    concurrency = 10

    async def do_seed(i: int):
        return await blockchain_client.post(
            ApiPaths.BLOCKCHAIN_SEED_BALANCE,
            json={
                "account_id": account_id,
                "currency": "SIM_COIN",
                "amount": amount_per_seed,
            },
        )

    results = await run_concurrent_async(do_seed, concurrency)
    success_count = sum(1 for r in results if r.status_code == 201)
    assert success_count == concurrency
    r_balance = await blockchain_client.get(
        ApiPaths.blockchain_balances(account_id, "SIM_COIN")
    )
    assert r_balance.status_code == 200
    final = r_balance.json()["balance"]
    assert final >= before + amount_per_seed
    assert final <= before + amount_per_seed * concurrency
