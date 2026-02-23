from uuid import uuid4

from tests.support import ApiPaths


async def test_list_portfolios(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.PORTFOLIOS)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_get_portfolio_not_found(blockchain_client) -> None:
    r = await blockchain_client.get(ApiPaths.portfolio_by_id(str(uuid4())))
    assert r.status_code == 404
