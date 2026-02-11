from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_get_portfolio(client: TestClient) -> None:
    r = client.get(ApiPaths.PORTFOLIO)
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert "accounts" in data
    assert "summary" in data
