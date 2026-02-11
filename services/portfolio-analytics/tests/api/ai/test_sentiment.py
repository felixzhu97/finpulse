from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_sentiment(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_SENTIMENT,
        json={"text": "Markets rose today."},
    )
    assert r.status_code == 200
    data = r.json()
    assert "label" in data
    assert "market_sentiment" in data
