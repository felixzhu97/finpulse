from uuid import uuid4

from tests.support import ApiPaths


async def test_list_orders(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.ORDERS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_order_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.order_by_id(str(uuid4())))
    assert r.status_code == 404
