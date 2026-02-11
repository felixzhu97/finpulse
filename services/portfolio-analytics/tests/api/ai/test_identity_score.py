from fastapi.testclient import TestClient

from tests.support import ApiPaths


def test_identity_score(client: TestClient) -> None:
    r = client.post(
        ApiPaths.AI_IDENTITY_SCORE,
        json={
            "document_type": "passport",
            "name_on_document": "Jane Doe",
            "date_of_birth": "1990-01-01",
            "id_number": "X123456",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "identity_score" in data
    assert "kyc_tier" in data
    assert data["kyc_tier"] in ("low", "medium", "high")
