from uuid import uuid4

from tests.support import ApiPaths


async def test_list_customers(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.CUSTOMERS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_customer_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.customer_by_id(str(uuid4())))
    assert r.status_code == 404
