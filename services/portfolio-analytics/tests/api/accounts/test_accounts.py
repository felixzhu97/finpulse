from uuid import uuid4

from tests.support import ApiPaths, run_concurrent_async


async def test_list_accounts(blockchain_client) -> None:
    r = await blockchain_client.get(
        f"{ApiPaths.ACCOUNTS}?limit=10&offset=0"
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    for item in data:
        assert "account_id" in item
        assert "customer_id" in item
        assert "account_type" in item
        assert "currency" in item
        assert "status" in item


async def test_list_accounts_pagination(blockchain_client) -> None:
    r = await blockchain_client.get(f"{ApiPaths.ACCOUNTS}?limit=2&offset=0")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    r2 = await blockchain_client.get(f"{ApiPaths.ACCOUNTS}?limit=2&offset=2")
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)


async def test_get_account_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.account_by_id(str(uuid4())))
    assert r.status_code == 404


async def test_concurrent_list_accounts(blockchain_client) -> None:
    async def do_list(i: int):
        return await blockchain_client.get(
            f"{ApiPaths.ACCOUNTS}?limit=100&offset=0"
        )

    results = await run_concurrent_async(do_list, 25)
    assert all(r.status_code == 200 for r in results)
    for r in results:
        assert isinstance(r.json(), list)
