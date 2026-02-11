from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_llm_summarise(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_LLM_SUMMARISE,
        json={
            "text": "Revenue grew. Margins expanded. Guidance was raised.",
            "max_sentences": 2,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
