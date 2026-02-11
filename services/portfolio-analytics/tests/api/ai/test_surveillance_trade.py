from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_surveillance_trade(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_SURVEILLANCE_TRADE,
        json={
            "quantity": 100,
            "notional": 5000,
            "side": "buy",
            "recent_quantities": [50, 60],
            "recent_notionals": [2500, 3000],
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "is_anomaly" in data
    assert "alert_type" in data
