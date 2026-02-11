from uuid import uuid4

from tests.support import ApiPaths


async def test_list_market_data(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.MARKET_DATA)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_market_data_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(
        ApiPaths.market_data_by_id(str(uuid4()))
    )
    assert r.status_code == 404
