from unittest.mock import patch, MagicMock

import pytest

from src.infrastructure.external_services.analytics.huggingface_adapter import HfSummariseAdapter


class TestHfSummariseAdapter:
    """Tests for the HfSummariseAdapter class."""

    @pytest.fixture
    def adapter(self) -> HfSummariseAdapter:
        return HfSummariseAdapter()

    def test_summarise_calls_hf_impl(self, adapter: HfSummariseAdapter) -> None:
        """Test that summarise calls the underlying HuggingFace implementation."""
        with patch(
            "src.infrastructure.external_services.analytics.huggingface_adapter.hf_summarise_impl"
        ) as mock_impl:
            mock_impl.return_value = {
                "summary": "Test summary",
                "model": "facebook/bart-large-cnn",
            }

            result = adapter.summarise("Long text to summarise")

            mock_impl.assert_called_once_with(
                text="Long text to summarise",
                max_length=150,
                min_length=30,
            )
            assert result["summary"] == "Test summary"

    def test_summarise_with_custom_params(self, adapter: HfSummariseAdapter) -> None:
        """Test summarise with custom parameters."""
        with patch(
            "src.infrastructure.external_services.analytics.huggingface_adapter.hf_summarise_impl"
        ) as mock_impl:
            mock_impl.return_value = {"summary": "Short summary", "model": "test"}

            result = adapter.summarise(
                "Long text",
                max_length=100,
                min_length=20,
            )

            mock_impl.assert_called_once_with(
                text="Long text",
                max_length=100,
                min_length=20,
            )
