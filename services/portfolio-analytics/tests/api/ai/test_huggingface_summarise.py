import pytest
from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_huggingface_summarise_returns_200(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_HUGGINGFACE_SUMMARISE,
        json={
            "text": "The company reported strong results.",
            "max_length": 60,
            "min_length": 20,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    if data.get("error"):
        pytest.skip(f"Hugging Face summarisation failed: {data['error']}")
