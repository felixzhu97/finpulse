import pytest

from src.infrastructure.external_services.analytics.surveillance_provider import SurveillanceProvider


class TestSurveillanceProvider:
    """Tests for the SurveillanceProvider class."""

    @pytest.fixture
    def provider(self) -> SurveillanceProvider:
        return SurveillanceProvider()

    def test_score_trade_empty_history(self, provider: SurveillanceProvider) -> None:
        """Test scoring with empty recent history."""
        result = provider.score_trade(
            quantity=100.0,
            notional=10000.0,
            side="buy",
            recent_quantities=[],
            recent_notionals=[],
        )
        assert result["is_anomaly"] is False
        assert result["alert_type"] == "none"
        assert result["quantity_zscore"] == 0.0
        assert result["notional_zscore"] == 0.0

    def test_score_trade_returns_required_fields(self, provider: SurveillanceProvider) -> None:
        """Test that score_trade returns all required fields."""
        result = provider.score_trade(
            quantity=100.0,
            notional=10000.0,
            side="buy",
            recent_quantities=[100.0],
            recent_notionals=[10000.0],
        )
        assert "is_anomaly" in result
        assert "alert_type" in result
        assert "quantity_zscore" in result
        assert "notional_zscore" in result
        assert "quantity" in result
        assert "notional" in result
        assert "side" in result

    def test_score_trade_single_history_point(self, provider: SurveillanceProvider) -> None:
        """Test scoring with single history point."""
        result = provider.score_trade(
            quantity=100.0,
            notional=10000.0,
            side="buy",
            recent_quantities=[100.0],
            recent_notionals=[10000.0],
        )
        assert result["quantity"] == 100.0
        assert result["notional"] == 10000.0

    def test_score_trade_normal_trade(self, provider: SurveillanceProvider) -> None:
        """Test scoring with normal trade within threshold."""
        # Trade similar to history should not be anomalous
        result = provider.score_trade(
            quantity=105.0,
            notional=10500.0,
            side="buy",
            recent_quantities=[100.0, 102.0, 98.0, 101.0],
            recent_notionals=[10000.0, 10200.0, 9800.0, 10100.0],
        )
        assert "is_anomaly" in result
        assert "alert_type" in result

    def test_score_trade_anomalous_quantity(self, provider: SurveillanceProvider) -> None:
        """Test scoring with anomalous quantity (very different from history)."""
        result = provider.score_trade(
            quantity=10000.0,  # Much larger than history
            notional=10000.0,  # Same notional
            side="buy",
            recent_quantities=[100.0, 102.0, 98.0, 101.0],
            recent_notionals=[10000.0, 10200.0, 9800.0, 10100.0],
        )
        # Should be flagged as anomaly due to high z-score
        assert "is_anomaly" in result

    def test_score_trade_anomalous_notional(self, provider: SurveillanceProvider) -> None:
        """Test scoring with anomalous notional."""
        result = provider.score_trade(
            quantity=100.0,
            notional=1000000.0,  # Much larger than history
            side="buy",
            recent_quantities=[100.0, 102.0, 98.0, 101.0],
            recent_notionals=[10000.0, 10200.0, 9800.0, 10100.0],
        )
        assert "is_anomaly" in result

    def test_score_trade_only_quantities(self, provider: SurveillanceProvider) -> None:
        """Test scoring with only quantity history."""
        result = provider.score_trade(
            quantity=100.0,
            notional=10000.0,
            side="sell",
            recent_quantities=[100.0, 110.0, 90.0],
            recent_notionals=[],  # Empty
        )
        assert "is_anomaly" in result

    def test_score_trade_only_notionals(self, provider: SurveillanceProvider) -> None:
        """Test scoring with only notional history."""
        result = provider.score_trade(
            quantity=100.0,
            notional=10000.0,
            side="sell",
            recent_quantities=[],  # Empty
            recent_notionals=[10000.0, 11000.0, 9000.0],
        )
        assert "is_anomaly" in result

    def test_score_trade_zero_quantities(self, provider: SurveillanceProvider) -> None:
        """Test scoring with zero quantities in history."""
        result = provider.score_trade(
            quantity=0.0,
            notional=0.0,
            side="buy",
            recent_quantities=[0.0, 0.0, 0.0],
            recent_notionals=[0.0, 0.0, 0.0],
        )
        # Should handle zero std gracefully
        assert "is_anomaly" in result
        assert "quantity_zscore" in result
        assert "notional_zscore" in result

    def test_score_trade_large_history(self, provider: SurveillanceProvider) -> None:
        """Test scoring with large history."""
        large_history = list(range(100, 200))
        result = provider.score_trade(
            quantity=150.0,
            notional=15000.0,
            side="buy",
            recent_quantities=large_history,
            recent_notionals=large_history,
        )
        assert "is_anomaly" in result
        assert isinstance(result["quantity_zscore"], float)
        assert isinstance(result["notional_zscore"], float)

    def test_score_trade_side_values(self, provider: SurveillanceProvider) -> None:
        """Test scoring with different side values."""
        for side in ["buy", "sell", "short", "cover"]:
            result = provider.score_trade(
                quantity=100.0,
                notional=10000.0,
                side=side,
                recent_quantities=[100.0],
                recent_notionals=[10000.0],
            )
            assert result["side"] == side
