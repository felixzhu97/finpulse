from fastapi.testclient import TestClient


def test_get_portfolio(client: TestClient):
  r = client.get("/api/v1/portfolio")
  assert r.status_code == 200
  data = r.json()
  assert "id" in data
  assert "accounts" in data
  assert "summary" in data


def test_seed_portfolio(client: TestClient):
  payload = {
    "id": "test-seed-1",
    "ownerName": "Test User",
    "baseCurrency": "USD",
    "accounts": [
      {
        "id": "acc-1",
        "name": "Brokerage",
        "type": "brokerage",
        "currency": "USD",
        "balance": 10000,
        "todayChange": 0,
        "holdings": [],
      }
    ],
    "summary": {"totalAssets": 10000, "totalLiabilities": 0, "netWorth": 10000, "todayChange": 0, "weekChange": 0},
    "history": [{"date": "2024-01-01", "value": 10000}],
  }
  r = client.post("/api/v1/seed", json=payload)
  assert r.status_code == 200
  assert r.json() == {"ok": True}


def test_seed_invalid_returns_400(client: TestClient):
  r = client.post("/api/v1/seed", json={"invalid": "payload"})
  assert r.status_code == 400
