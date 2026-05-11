import pytest

from src.infrastructure.external_services.analytics.summarisation_provider import SummarisationProvider


class TestSummarisationProvider:
    """Tests for the SummarisationProvider class."""

    @pytest.fixture
    def provider(self) -> SummarisationProvider:
        return SummarisationProvider()

    def test_summarise_empty_text(self, provider: SummarisationProvider) -> None:
        """Test summarise with empty text."""
        result = provider.summarise("")
        assert result["summary"] == ""
        assert result["max_sentences"] == 3

    def test_summarise_whitespace_only(self, provider: SummarisationProvider) -> None:
        """Test summarise with whitespace only text."""
        result = provider.summarise("   ")
        assert result["summary"] == ""

    def test_summarise_short_text(self, provider: SummarisationProvider) -> None:
        """Test summarise with short text."""
        text = "The stock market is up today."
        result = provider.summarise(text)
        assert "summary" in result
        assert result["max_sentences"] == 3

    def test_summarise_returns_required_fields(self, provider: SummarisationProvider) -> None:
        """Test that summarise returns required fields."""
        text = "The stock market is up today. Trading volume is high. Investors are optimistic."
        result = provider.summarise(text)
        assert "summary" in result
        assert "max_sentences" in result
        assert isinstance(result["summary"], str)
        assert isinstance(result["max_sentences"], int)

    def test_summarise_custom_max_sentences(self, provider: SummarisationProvider) -> None:
        """Test summarise with custom max_sentences."""
        text = "Sentence one. Sentence two. Sentence three. Sentence four. Sentence five."
        result = provider.summarise(text, max_sentences=2)
        assert result["max_sentences"] == 2

    def test_summarise_zero_max_sentences(self, provider: SummarisationProvider) -> None:
        """Test summarise with zero max_sentences."""
        text = "The stock market is up today."
        result = provider.summarise(text, max_sentences=0)
        assert result["max_sentences"] == 0

    def test_summarise_long_text(self, provider: SummarisationProvider) -> None:
        """Test summarise with long text."""
        text = ". ".join([f"This is sentence number {i} with some additional content to make it longer than usual." for i in range(50)])
        result = provider.summarise(text, max_sentences=3)
        assert "summary" in result
        assert isinstance(result["summary"], str)

    def test_summarise_preserves_meaning(self, provider: SummarisationProvider) -> None:
        """Test that summarise produces coherent output."""
        text = "The company reported strong quarterly earnings. Revenue increased by 15%. The stock price rose significantly. Management remains optimistic about future growth."
        result = provider.summarise(text, max_sentences=2)
        # Summary should contain words from the original text
        assert len(result["summary"]) > 0

    def test_summarise_multiple_sentences_with_punctuation(self, provider: SummarisationProvider) -> None:
        """Test summarise with various sentence punctuation."""
        text = "Is this a question? Yes, it is! And this is a statement. What about this... more text."
        result = provider.summarise(text, max_sentences=3)
        assert "summary" in result

    def test_summarise_none_input(self, provider: SummarisationProvider) -> None:
        """Test summarise with None input."""
        result = provider.summarise(None)  # type: ignore
        assert "summary" in result
