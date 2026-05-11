import pytest

from src.infrastructure.external_services.analytics.fraud_detector_provider import FraudDetectorProvider


class TestFraudDetectorProvider:
    """Tests for the FraudDetectorProvider class."""

    @pytest.fixture
    def provider(self) -> FraudDetectorProvider:
        return FraudDetectorProvider()

    def test_score_returns_dict(self, provider: FraudDetectorProvider) -> None:
        """Test that score returns a dictionary."""
        result = provider.score(
            amount=100.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
        )
        assert isinstance(result, dict)

    def test_score_contains_required_fields(self, provider: FraudDetectorProvider) -> None:
        """Test that score returns all required fields."""
        result = provider.score(
            amount=100.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
        )
        assert "is_anomaly" in result
        assert "anomaly_score" in result
        assert "recommendation" in result
        assert "amount" in result
        assert "amount_currency" in result

    def test_score_with_small_amount(self, provider: FraudDetectorProvider) -> None:
        """Test score with a small transaction amount."""
        result = provider.score(
            amount=10.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
        )
        assert result["amount"] == 10.0
        assert result["amount_currency"] == "USD"

    def test_score_with_large_amount(self, provider: FraudDetectorProvider) -> None:
        """Test score with a large transaction amount."""
        result = provider.score(
            amount=100000.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
        )
        assert result["amount"] == 100000.0

    def test_score_with_reference_samples(self, provider: FraudDetectorProvider) -> None:
        """Test score with provided reference samples."""
        samples = [
            [100.0, 10, 1, 5],
            [200.0, 11, 2, 3],
            [150.0, 12, 3, 7],
            [180.0, 13, 4, 2],
            [220.0, 14, 5, 6],
            [190.0, 15, 6, 4],
            [170.0, 16, 0, 8],
            [210.0, 9, 1, 5],
            [160.0, 8, 2, 3],
            [230.0, 7, 3, 7],
        ]
        result = provider.score(
            amount=100.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
            reference_samples=samples,
        )
        assert "is_anomaly" in result

    def test_score_with_insufficient_reference_samples(self, provider: FraudDetectorProvider) -> None:
        """Test score with fewer than 10 reference samples (should use fallback)."""
        samples = [
            [100.0, 10, 1, 5],
            [200.0, 11, 2, 3],
        ]
        result = provider.score(
            amount=100.0,
            amount_currency="EUR",
            hour_of_day=14,
            day_of_week=3,
            recent_count_24h=2,
            reference_samples=samples,
        )
        assert "is_anomaly" in result
        assert result["amount_currency"] == "EUR"

    def test_score_hour_of_day_boundaries(self, provider: FraudDetectorProvider) -> None:
        """Test score at different hours of day."""
        for hour in [0, 6, 12, 18, 23]:
            result = provider.score(
                amount=100.0,
                amount_currency="USD",
                hour_of_day=hour,
                day_of_week=1,
                recent_count_24h=5,
            )
            assert "is_anomaly" in result

    def test_score_day_of_week_boundaries(self, provider: FraudDetectorProvider) -> None:
        """Test score for different days of week."""
        for day in range(7):
            result = provider.score(
                amount=100.0,
                amount_currency="USD",
                hour_of_day=10,
                day_of_week=day,
                recent_count_24h=5,
            )
            assert "is_anomaly" in result

    def test_score_zero_recent_count(self, provider: FraudDetectorProvider) -> None:
        """Test score with zero recent transactions."""
        result = provider.score(
            amount=100.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=0,
        )
        assert "is_anomaly" in result

    def test_score_anomaly_score_is_float(self, provider: FraudDetectorProvider) -> None:
        """Test that anomaly_score is a float."""
        result = provider.score(
            amount=100.0,
            amount_currency="USD",
            hour_of_day=10,
            day_of_week=1,
            recent_count_24h=5,
        )
        assert isinstance(result["anomaly_score"], float)
