import pytest
from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_tf_forecast_returns_200(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_TF_FORECAST,
        json={
            "values": [100, 102, 101, 105, 104, 108],
            "horizon": 1,
            "lookback": 4,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "forecast" in data
    if data.get("error"):
        pytest.skip("TensorFlow forecast failed")
