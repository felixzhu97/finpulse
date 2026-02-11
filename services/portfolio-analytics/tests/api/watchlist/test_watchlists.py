from uuid import uuid4

from tests.support import ApiPaths


async def test_list_watchlists(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.WATCHLISTS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_watchlist_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.watchlist_by_id(str(uuid4())))
    assert r.status_code == 404
