import pytest

from tests.support import ApiPaths, get_two_account_ids_async, run_concurrent_async


async def test_list_blocks(blockchain_client) -> None:
    r = await blockchain_client.get(f"{ApiPaths.BLOCKCHAIN_BLOCKS}?limit=10&offset=0")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_list_blocks_pagination(blockchain_client) -> None:
    r = await blockchain_client.get(
        f"{ApiPaths.BLOCKCHAIN_BLOCKS}?limit=5&offset=0"
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    r2 = await blockchain_client.get(
        f"{ApiPaths.BLOCKCHAIN_BLOCKS}?limit=2&offset=1"
    )
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)


async def test_get_block_by_index_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.blockchain_block(999999))
    assert r.status_code == 404


async def test_concurrent_list_blocks_while_transfers(
    blockchain_client,
) -> None:
    sender_id, receiver_id = await get_two_account_ids_async(blockchain_client)
    if not sender_id or not receiver_id:
        pytest.skip("need two accounts from portfolio")
    await blockchain_client.post(
        ApiPaths.BLOCKCHAIN_SEED_BALANCE,
        json={"account_id": sender_id, "currency": "SIM_COIN", "amount": 50.0},
    )

    async def do_transfer(i: int):
        return await blockchain_client.post(
            ApiPaths.BLOCKCHAIN_TRANSFERS,
            json={
                "sender_account_id": sender_id,
                "receiver_account_id": receiver_id,
                "amount": 5.0,
                "currency": "SIM_COIN",
            },
        )

    async def do_list_blocks(i: int):
        return await blockchain_client.get(
            f"{ApiPaths.BLOCKCHAIN_BLOCKS}?limit=20&offset=0"
        )

    transfer_results = await run_concurrent_async(do_transfer, 5)
    list_results = await run_concurrent_async(do_list_blocks, 15)
    assert all(r.status_code == 201 for r in transfer_results)
    assert all(r.status_code == 200 for r in list_results)
    for r in list_results:
        assert isinstance(r.json(), list)
