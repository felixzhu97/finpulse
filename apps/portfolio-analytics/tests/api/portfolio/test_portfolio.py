from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_get_portfolio(client: TestClient) -> None:
    r = client.get(ApiPaths.PORTFOLIO)
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert "accounts" in data
    assert "summary" in data


def test_get_portfolio_risk_summary(client: TestClient) -> None:
    r = client.get(ApiPaths.PORTFOLIO_RISK_SUMMARY)
    assert r.status_code == 200
    data = r.json()
    assert "highRatio" in data
    assert "topHoldingsConcentration" in data


def test_get_portfolio_asset_allocation_by_account_type(client: TestClient) -> None:
    r = client.get(ApiPaths.PORTFOLIO_ASSET_ALLOCATION)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        first = data[0]
        assert "type" in first
        assert "value" in first
