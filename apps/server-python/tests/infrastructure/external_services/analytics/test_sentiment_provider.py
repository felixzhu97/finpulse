import pytest

from src.infrastructure.external_services.analytics.sentiment_provider import SentimentProvider


class TestSentimentProvider:
    """Tests for the SentimentProvider class."""

    @pytest.fixture
    def provider(self) -> SentimentProvider:
        return SentimentProvider()

    def test_score_positive_text(self, provider: SentimentProvider) -> None:
        """Test sentiment scoring with positive text."""
        result = provider.score("This is amazing! I love it so much!")
        assert result["label"] == "positive"
        assert result["compound"] >= 0.05
        assert result["market_sentiment"] == "positive"

    def test_score_negative_text(self, provider: SentimentProvider) -> None:
        """Test sentiment scoring with negative text."""
        result = provider.score("This is terrible! I hate it so much!")
        assert result["label"] == "negative"
        assert result["compound"] <= -0.05

    def test_score_neutral_text(self, provider: SentimentProvider) -> None:
        """Test sentiment scoring with neutral text."""
        result = provider.score("The stock price is 100 dollars.")
        assert result["label"] == "neutral"
        assert -0.05 < result["compound"] < 0.05

    def test_score_returns_all_components(self, provider: SentimentProvider) -> None:
        """Test that score returns all sentiment components."""
        result = provider.score("Market is doing well today.")
        assert "compound" in result
        assert "negative" in result
        assert "neutral" in result
        assert "positive" in result
        assert "label" in result
        assert "market_sentiment" in result

    def test_score_compound_in_range(self, provider: SentimentProvider) -> None:
        """Test that compound score is in valid range [-1, 1]."""
        texts = [
            "Great stock!",
            "Terrible loss!",
            "The price is stable.",
            "Amazing gains today!",
            "Worst day ever!",
        ]
        for text in texts:
            result = provider.score(text)
            assert -1.0 <= result["compound"] <= 1.0

    def test_score_negative_component(self, provider: SentimentProvider) -> None:
        """Test that negative component is non-negative."""
        result = provider.score("This is bad and wrong!")
        assert result["negative"] >= 0.0
        assert result["negative"] <= 1.0

    def test_score_neutral_component(self, provider: SentimentProvider) -> None:
        """Test that neutral component is non-negative."""
        result = provider.score("The price is $100.")
        assert result["neutral"] >= 0.0
        assert result["neutral"] <= 1.0

    def test_score_positive_component(self, provider: SentimentProvider) -> None:
        """Test that positive component is non-negative."""
        result = provider.score("This is wonderful!")
        assert result["positive"] >= 0.0
        assert result["positive"] <= 1.0

    def test_score_components_sum_to_one(self, provider: SentimentProvider) -> None:
        """Test that neg + neu + pos approximately sum to 1."""
        result = provider.score("The market shows mixed signals today.")
        total = result["negative"] + result["neutral"] + result["positive"]
        assert 0.99 <= total <= 1.01

    def test_score_empty_text(self, provider: SentimentProvider) -> None:
        """Test score with empty text."""
        result = provider.score("")
        # Empty text should still return valid structure
        assert "compound" in result
        assert "label" in result

    def test_score_very_long_text(self, provider: SentimentProvider) -> None:
        """Test score with very long text."""
        long_text = "The stock market is performing well today. " * 100
        result = provider.score(long_text)
        assert "compound" in result
        assert isinstance(result["compound"], float)

    def test_score_special_characters(self, provider: SentimentProvider) -> None:
        """Test score with special characters and emojis."""
        result = provider.score("Stock up 10%!!! 🚀🚀🚀")
        assert "compound" in result
        assert "label" in result
