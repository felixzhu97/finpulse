from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_fraud_check(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_FRAUD_CHECK,
        json={
            "amount": 1000,
            "amount_currency": "USD",
            "hour_of_day": 12,
            "day_of_week": 3,
            "recent_count_24h": 2,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "is_anomaly" in data
    assert "recommendation" in data
    assert data["recommendation"] in ("allow", "review", "block")
