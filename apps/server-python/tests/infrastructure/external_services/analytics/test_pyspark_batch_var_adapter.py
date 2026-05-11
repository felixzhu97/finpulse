from unittest.mock import MagicMock

import pytest

from src.infrastructure.external_services.analytics.pyspark_batch_var_adapter import PySparkBatchRiskVarAdapter


class TestPySparkBatchRiskVarAdapter:
    """Tests for the PySparkBatchRiskVarAdapter class."""

    def test_compute_var_batch_empty_entries(self) -> None:
        """Test compute_var_batch with empty entries."""
        adapter = PySparkBatchRiskVarAdapter()

        result = adapter.compute_var_batch([])

        assert result == []

    def test_compute_var_batch_uses_default_provider(self) -> None:
        """Test that adapter uses default RiskVarProvider when none provided."""
        adapter = PySparkBatchRiskVarAdapter()

        # Should not raise when using default provider
        assert adapter._risk_var is not None

    def test_compute_var_batch_single_entry(self) -> None:
        """Test compute_var_batch with single entry."""
        mock_provider = MagicMock()
        mock_provider.compute.return_value = {
            "var": -0.05,
            "var_percent": -5.0,
            "method": "historical",
            "confidence": 0.95,
            "mean_return": 0.01,
            "volatility": 0.15,
            "interpretation": "Low risk",
        }

        adapter = PySparkBatchRiskVarAdapter(risk_var_provider=mock_provider)

        result = adapter.compute_var_batch([("portfolio-1", [0.01, -0.02])])

        assert len(result) == 1
        assert result[0]["portfolio_id"] == "portfolio-1"
