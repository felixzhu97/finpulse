from unittest.mock import patch, MagicMock

import pytest

from src.infrastructure.external_services.analytics.risk_var_provider import RiskVarProvider


class TestRiskVarProvider:
    """Tests for the RiskVarProvider class."""

    @pytest.fixture
    def provider(self) -> RiskVarProvider:
        return RiskVarProvider()

    def test_compute_empty_returns_insufficient_data(
        self, provider: RiskVarProvider
    ) -> None:
        """Test compute with empty returns."""
        result = provider.compute([])
        assert result["var"] == 0.0
        assert result["interpretation"] == "Insufficient return history."

    def test_compute_historical_returns_required_fields(
        self, provider: RiskVarProvider
    ) -> None:
        """Test that compute returns all required fields."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns, method="historical")

        assert "var" in result
        assert "var_percent" in result
        assert "method" in result
        assert "confidence" in result
        assert "mean_return" in result
        assert "volatility" in result
        assert "interpretation" in result

    def test_compute_historical_method(
        self, provider: RiskVarProvider
    ) -> None:
        """Test compute with historical method."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns, method="historical")

        assert result["method"] == "historical"
        assert isinstance(result["var"], float)

    def test_compute_parametric_method(self, provider: RiskVarProvider) -> None:
        """Test compute with parametric method."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns, method="parametric")

        assert result["method"] == "parametric"
        assert isinstance(result["var"], float)

    def test_compute_custom_confidence(self, provider: RiskVarProvider) -> None:
        """Test compute with custom confidence level."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns, confidence=0.99)

        assert result["confidence"] == 0.99

    def test_compute_single_return(self, provider: RiskVarProvider) -> None:
        """Test compute with single return value."""
        result = provider.compute([0.05])

        assert isinstance(result["var"], float)
        assert isinstance(result["mean_return"], float)

    def test_compute_volatility_calculation(self, provider: RiskVarProvider) -> None:
        """Test that volatility is calculated."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns)

        assert result["volatility"] >= 0

    def test_compute_var_percent_is_percentage(self, provider: RiskVarProvider) -> None:
        """Test that var_percent is the var expressed as percentage."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns)

        # var_percent should be var * 100
        assert abs(result["var_percent"] - result["var"] * 100) < 0.0001

    def test_compute_interpretation_is_string(self, provider: RiskVarProvider) -> None:
        """Test that interpretation is a String."""
        returns = [0.01, -0.02, 0.015, -0.01, 0.005]
        result = provider.compute(returns)

        assert isinstance(result["interpretation"], str)
        assert len(result["interpretation"]) > 0
