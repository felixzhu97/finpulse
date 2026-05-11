from unittest.mock import MagicMock, patch

import pytest

from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.application.ports.services.analytics_ports import (
    IRiskVarPort,
    IFraudDetectorPort,
    ISurveillancePort,
    ISentimentPort,
    IIdentityPort,
    IForecastPort,
    ISummarisationPort,
    IOllamaGeneratePort,
    IHfSummarisePort,
    IBatchRiskVarPort,
)


class MockRiskVarPort(IRiskVarPort):
    def __init__(self, result: dict = None):
        self._result = result or {"var": 0.02, "expected_shortfall": 0.025}

    def compute(self, returns, confidence, method):
        return self._result.copy()


class MockFraudDetectorPort(IFraudDetectorPort):
    def __init__(self, result: dict = None):
        self._result = result or {"is_anomaly": False, "score": 0.1}

    def score(self, amount, amount_currency, hour_of_day, day_of_week, recent_count_24h, reference_samples):
        return self._result.copy()


class MockSurveillancePort(ISurveillancePort):
    def __init__(self, result: dict = None):
        self._result = result or {"is_anomaly": False, "quantity_zscore": 0.5, "notional_zscore": 0.5}

    def score_trade(self, quantity, notional, side, recent_quantities, recent_notionals):
        return self._result.copy()


class MockSentimentPort(ISentimentPort):
    def __init__(self, result: dict = None):
        self._result = result or {"sentiment": "positive", "score": 0.8}

    def score(self, text):
        return self._result.copy()


class MockIdentityPort(IIdentityPort):
    def __init__(self, result: dict = None):
        self._result = result or {"identity_score": 0.85, "verified": True}

    def score(self, document_type, name_on_document, date_of_birth, id_number):
        return self._result.copy()


class MockForecastPort(IForecastPort):
    def __init__(self, result: dict = None):
        self._result = result or {"forecast": [100, 105, 110], "horizon": 3}

    def forecast(self, values, horizon):
        return self._result.copy()


class MockSummarisationPort(ISummarisationPort):
    def __init__(self, result: dict = None):
        self._result = result or {"summary": "Test summary text."}

    def summarise(self, text, max_sentences):
        return self._result.copy()


class MockOllamaGeneratePort(IOllamaGeneratePort):
    def __init__(self, result: dict = None):
        self._result = result or {"response": "Generated text.", "model": "llama2"}

    def generate(self, prompt, model):
        return self._result.copy()


class MockHfSummarisePort(IHfSummarisePort):
    def __init__(self, result: dict = None):
        self._result = result or {"summary": "HuggingFace summary.", "model": "facebook/bart-large-cnn"}

    def summarise(self, text, max_length, min_length):
        return self._result.copy()


class MockBatchRiskVarPort(IBatchRiskVarPort):
    def __init__(self, result: list = None):
        self._result = result or [{"var": 0.01}, {"var": 0.02}]

    def compute_var_batch(self, entries, confidence, method):
        return self._result


@pytest.fixture
def full_service():
    return AnalyticsApplicationService(
        risk_var=MockRiskVarPort(),
        fraud=MockFraudDetectorPort(),
        surveillance=MockSurveillancePort(),
        sentiment=MockSentimentPort(),
        identity=MockIdentityPort(),
        forecast_provider=MockForecastPort(),
        summarisation=MockSummarisationPort(),
        ollama_generate=MockOllamaGeneratePort(),
        hf_summarise=MockHfSummarisePort(),
        batch_risk_var=MockBatchRiskVarPort(),
    )


class TestAnalyticsApplicationService:
    def test_compute_var(self, full_service):
        result = full_service.compute_var([0.01, 0.02, -0.01, 0.03])
        
        assert "var" in result

    def test_compute_var_with_portfolio_id(self, full_service):
        result = full_service.compute_var([0.01, 0.02], portfolio_id="portfolio-123")
        
        assert result.get("portfolio_id") == "portfolio-123"

    def test_compute_var_custom_confidence(self, full_service):
        result = full_service.compute_var([0.01], confidence=0.99)
        
        assert "var" in result

    def test_compute_var_batch(self, full_service):
        entries = [("AAPL", [0.01, 0.02]), ("MSFT", [-0.01, 0.03])]
        result = full_service.compute_var_batch(entries)
        
        assert isinstance(result, list)
        assert len(result) == 2

    def test_compute_var_batch_empty_when_no_provider(self):
        service = AnalyticsApplicationService(
            risk_var=MockRiskVarPort(),
            fraud=MockFraudDetectorPort(),
            surveillance=MockSurveillancePort(),
            sentiment=MockSentimentPort(),
            identity=MockIdentityPort(),
            forecast_provider=MockForecastPort(),
            summarisation=MockSummarisationPort(),
            ollama_generate=MockOllamaGeneratePort(),
            hf_summarise=MockHfSummarisePort(),
            batch_risk_var=None,
        )
        
        result = service.compute_var_batch([])
        
        assert result == []

    def test_check_fraud(self, full_service):
        result = full_service.check_fraud(
            amount=1000.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
        )
        
        assert "is_anomaly" in result

    def test_check_fraud_with_reference_samples(self, full_service):
        result = full_service.check_fraud(
            amount=1000.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
            reference_samples=[[100, 200], [150, 250]],
        )
        
        assert "is_anomaly" in result

    def test_score_trade_surveillance(self, full_service):
        result = full_service.score_trade_surveillance(
            quantity=100.0,
            notional=50000.0,
            side="buy",
            recent_quantities=[50.0, 75.0],
            recent_notionals=[25000.0, 37500.0],
        )
        
        assert "is_anomaly" in result

    def test_score_trade_surveillance_with_instrument_id(self, full_service):
        result = full_service.score_trade_surveillance(
            quantity=100.0,
            notional=50000.0,
            side="sell",
            recent_quantities=[50.0],
            recent_notionals=[25000.0],
            instrument_id="AAPL",
        )
        
        assert result.get("instrument_id") == "AAPL"

    def test_score_sentiment(self, full_service):
        result = full_service.score_sentiment("This stock is doing great!")
        
        assert "sentiment" in result

    def test_score_identity(self, full_service):
        result = full_service.score_identity(
            document_type="passport",
            name_on_document="John Doe",
        )
        
        assert "identity_score" in result

    def test_score_identity_with_optional_fields(self, full_service):
        result = full_service.score_identity(
            document_type="drivers_license",
            name_on_document="Jane Doe",
            date_of_birth="1990-01-01",
            id_number="DL123456",
            country_iso="US",
        )
        
        assert result.get("country_iso") == "US"

    def test_forecast(self, full_service):
        result = full_service.forecast([100, 105, 110, 115])
        
        assert "forecast" in result

    def test_forecast_with_horizon(self, full_service):
        result = full_service.forecast([100, 105, 110], horizon=5)
        
        assert "forecast" in result

    def test_summarise(self, full_service):
        result = full_service.summarise("Long text that needs summarization.")
        
        assert "summary" in result

    def test_summarise_custom_max_sentences(self, full_service):
        result = full_service.summarise("Text.", max_sentences=1)
        
        assert "summary" in result

    def test_ollama_generate(self, full_service):
        result = full_service.ollama_generate("What is the market outlook?")
        
        assert "response" in result

    def test_ollama_generate_with_model(self, full_service):
        result = full_service.ollama_generate("Hello")
        
        assert "response" in result

    def test_ollama_generate_handles_exception(self):
        broken_ollama = MagicMock()
        broken_ollama.generate.side_effect = Exception("Connection failed")
        
        service = AnalyticsApplicationService(
            risk_var=MockRiskVarPort(),
            fraud=MockFraudDetectorPort(),
            surveillance=MockSurveillancePort(),
            sentiment=MockSentimentPort(),
            identity=MockIdentityPort(),
            forecast_provider=MockForecastPort(),
            summarisation=MockSummarisationPort(),
            ollama_generate=broken_ollama,
            hf_summarise=MockHfSummarisePort(),
        )
        
        result = service.ollama_generate("test prompt")
        
        assert "error" in result

    def test_hf_summarise(self, full_service):
        result = full_service.hf_summarise("Text to summarize.")
        
        assert "summary" in result

    def test_hf_summarise_custom_length(self, full_service):
        result = full_service.hf_summarise("Text.", max_length=50, min_length=10)
        
        assert "summary" in result

    def test_hf_summarise_handles_exception(self):
        broken_hf = MagicMock()
        broken_hf.summarise.side_effect = Exception("Model loading failed")
        
        service = AnalyticsApplicationService(
            risk_var=MockRiskVarPort(),
            fraud=MockFraudDetectorPort(),
            surveillance=MockSurveillancePort(),
            sentiment=MockSentimentPort(),
            identity=MockIdentityPort(),
            forecast_provider=MockForecastPort(),
            summarisation=MockSummarisationPort(),
            ollama_generate=MockOllamaGeneratePort(),
            hf_summarise=broken_hf,
        )
        
        result = service.hf_summarise("test text")
        
        assert "error" in result
