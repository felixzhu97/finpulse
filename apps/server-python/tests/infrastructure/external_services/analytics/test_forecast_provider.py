import pytest

from src.infrastructure.external_services.analytics.forecast_provider import ForecastProvider


class TestForecastProvider:
    """Tests for the ForecastProvider class."""

    @pytest.fixture
    def provider(self) -> ForecastProvider:
        return ForecastProvider()

    def test_forecast_empty_values(self, provider: ForecastProvider) -> None:
        """Test forecast with empty values list."""
        result = provider.forecast([], horizon=1)
        assert result["forecast"] == []
        assert result["horizon"] == 1

    def test_forecast_single_value(self, provider: ForecastProvider) -> None:
        """Test forecast with single value."""
        result = provider.forecast([100.0], horizon=1)
        assert result["forecast"] == []
        assert result["horizon"] == 1

    def test_forecast_zero_horizon(self, provider: ForecastProvider) -> None:
        """Test forecast with zero horizon."""
        result = provider.forecast([100.0, 110.0], horizon=0)
        assert result["forecast"] == []
        assert result["horizon"] == 0

    def test_forecast_negative_horizon(self, provider: ForecastProvider) -> None:
        """Test forecast with negative horizon."""
        result = provider.forecast([100.0, 110.0], horizon=-1)
        assert result["forecast"] == []
        assert result["horizon"] == -1

    def test_forecast_two_values_one_horizon(self, provider: ForecastProvider) -> None:
        """Test forecast with two values and horizon of 1."""
        result = provider.forecast([100.0, 110.0], horizon=1)
        assert len(result["forecast"]) == 1
        assert result["horizon"] == 1

    def test_forecast_multiple_values_multiple_horizon(self, provider: ForecastProvider) -> None:
        """Test forecast with multiple values and horizon."""
        values = [100.0, 110.0, 120.0, 130.0, 140.0]
        result = provider.forecast(values, horizon=3)
        assert len(result["forecast"]) == 3
        assert result["horizon"] == 3

    def test_forecast_returns_dict(self, provider: ForecastProvider) -> None:
        """Test that forecast returns a dictionary."""
        result = provider.forecast([100.0, 110.0], horizon=1)
        assert isinstance(result, dict)
        assert "forecast" in result
        assert "horizon" in result

    def test_forecast_forecast_contains_floats(self, provider: ForecastProvider) -> None:
        """Test that forecast values are floats."""
        values = [100.0, 110.0, 120.0, 130.0, 140.0]
        result = provider.forecast(values, horizon=2)
        for val in result["forecast"]:
            assert isinstance(val, float)
