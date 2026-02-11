from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_dl_forecast(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_DL_FORECAST,
        json={"values": [100, 102, 98, 105, 103], "horizon": 2},
    )
    assert r.status_code == 200
    data = r.json()
    assert "forecast" in data
    assert len(data["forecast"]) == 2
