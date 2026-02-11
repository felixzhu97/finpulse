from uuid import uuid4

from tests.support import ApiPaths


async def test_list_cash_transactions(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.CASH_TRANSACTIONS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_cash_transaction_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(
        ApiPaths.cash_transaction_by_id(str(uuid4()))
    )
    assert r.status_code == 404
