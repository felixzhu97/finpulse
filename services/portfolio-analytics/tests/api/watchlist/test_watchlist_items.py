from uuid import uuid4

from tests.support import ApiPaths


async def test_list_watchlist_items(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.WATCHLIST_ITEMS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_watchlist_item_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(
        ApiPaths.watchlist_item_by_id(str(uuid4()))
    )
    assert r.status_code == 404
