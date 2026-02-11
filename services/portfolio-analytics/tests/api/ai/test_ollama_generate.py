import pytest
from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_ollama_generate_returns_200(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_OLLAMA_GENERATE,
        json={"prompt": "Hi."},
    )
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    if data.get("error"):
        pytest.skip(f"Ollama unreachable or model missing: {data['error']}")
