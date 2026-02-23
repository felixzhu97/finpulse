from uuid import uuid4

from tests.support import ApiPaths


async def test_list_positions(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.POSITIONS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_position_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.position_by_id(str(uuid4())))
    assert r.status_code == 404
