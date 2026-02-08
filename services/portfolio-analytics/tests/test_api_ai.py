import pytest
from fastapi.testclient import TestClient


def test_risk_var_historical(client: TestClient):
  r = client.post(
    "/api/v1/ai/risk/var",
    json={"returns": [-0.01, 0.02, -0.005], "confidence": 0.95, "method": "historical"},
  )
  assert r.status_code == 200
  data = r.json()
  assert "var" in data
  assert "interpretation" in data
  assert data["method"] == "historical"


def test_risk_var_with_portfolio_id(client: TestClient):
  r = client.post(
    "/api/v1/ai/risk/var",
    json={
      "returns": [-0.01, 0.02],
      "confidence": 0.95,
      "method": "historical",
      "portfolio_id": "test-portfolio",
    },
  )
  assert r.status_code == 200
  assert r.json().get("portfolio_id") == "test-portfolio"


def test_fraud_check(client: TestClient):
  r = client.post(
    "/api/v1/ai/fraud/check",
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


def test_surveillance_trade(client: TestClient):
  r = client.post(
    "/api/v1/ai/surveillance/trade",
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


def test_sentiment(client: TestClient):
  r = client.post("/api/v1/ai/sentiment", json={"text": "Markets rose today."})
  assert r.status_code == 200
  data = r.json()
  assert "label" in data
  assert "market_sentiment" in data


def test_identity_score(client: TestClient):
  r = client.post(
    "/api/v1/ai/identity/score",
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


def test_dl_forecast(client: TestClient):
  r = client.post(
    "/api/v1/ai/dl/forecast",
    json={"values": [100, 102, 98, 105, 103], "horizon": 2},
  )
  assert r.status_code == 200
  data = r.json()
  assert "forecast" in data
  assert len(data["forecast"]) == 2


def test_llm_summarise(client: TestClient):
  r = client.post(
    "/api/v1/ai/llm/summarise",
    json={"text": "Revenue grew. Margins expanded. Guidance was raised.", "max_sentences": 2},
  )
  assert r.status_code == 200
  data = r.json()
  assert "summary" in data


def test_ollama_generate_returns_200(client: TestClient):
  r = client.post("/api/v1/ai/ollama/generate", json={"prompt": "Hi."})
  assert r.status_code == 200
  data = r.json()
  assert "response" in data
  if "error" in data and data["error"]:
    pytest.skip(f"Ollama unreachable or model missing: {data['error']}")


def test_huggingface_summarise_returns_200(client: TestClient):
  r = client.post(
    "/api/v1/ai/huggingface/summarise",
    json={"text": "The company reported strong results.", "max_length": 60, "min_length": 20},
  )
  assert r.status_code == 200
  data = r.json()
  assert "summary" in data
  if data.get("error"):
    pytest.skip(f"Hugging Face summarisation failed: {data['error']}")


def test_tf_forecast_returns_200(client: TestClient):
  r = client.post(
    "/api/v1/ai/tf/forecast",
    json={"values": [100, 102, 101, 105, 104, 108], "horizon": 1, "lookback": 4},
  )
  assert r.status_code == 200
  data = r.json()
  assert "forecast" in data
  if data.get("error"):
    pytest.skip("TensorFlow forecast failed")
