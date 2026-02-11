from uuid import uuid4

from tests.support import ApiPaths


async def test_list_bonds(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.BONDS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_bond_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.bond_by_id(str(uuid4())))
    assert r.status_code == 404
