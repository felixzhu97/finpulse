from tests.support import ApiPaths


async def test_quotes_get(blockchain_client) -> None:
    r = await blockchain_client.get(f"{ApiPaths.QUOTES}?symbols=AAPL,MSFT")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
