from unittest.mock import patch, MagicMock

import pytest

from src.infrastructure.external_services.analytics.huggingface_client import (
    _get_pipeline,
    summarise,
)


class TestHfSummariseClient:
    """Tests for the HuggingFace summarisation client."""

    def test_get_pipeline_returns_pipeline(self) -> None:
        """Test that _get_pipeline returns a pipeline instance."""
        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._pipeline",
            None,
        ):
            with patch(
                "src.infrastructure.external_services.analytics.huggingface_client.transformers.pipeline"
            ) as mock_pipeline:
                mock_instance = MagicMock()
                mock_pipeline.return_value = mock_instance

                result = _get_pipeline()

                assert result is not None
                mock_pipeline.assert_called_once()

    def test_get_pipeline_caches_result(self) -> None:
        """Test that _get_pipeline caches the pipeline."""
        mock_pipeline = MagicMock()

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._pipeline",
            mock_pipeline,
        ):
            result = _get_pipeline()

            assert result is mock_pipeline

    def test_summarise_returns_summary(self) -> None:
        """Test that summarise returns a summary."""
        mock_pipeline = MagicMock()
        mock_pipeline.return_value = [
            {"summary_text": "This is a test summary."}
        ]

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            return_value=mock_pipeline,
        ):
            result = summarise("This is a long text that needs summarisation.")

            assert "summary" in result
            assert "model" in result
            assert result["summary"] == "This is a test summary."

    def test_summarise_with_custom_max_length(self) -> None:
        """Test summarise with custom max_length."""
        mock_pipeline = MagicMock()
        mock_pipeline.return_value = [{"summary_text": "Short summary."}]

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            return_value=mock_pipeline,
        ):
            result = summarise("Long text", max_length=50, min_length=10)

            call_args = mock_pipeline.call_args
            assert call_args[1]["max_length"] == 50
            assert call_args[1]["min_length"] == 10

    def test_summarise_handles_pipeline_error(self) -> None:
        """Test that summarise handles pipeline errors gracefully."""
        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            side_effect=Exception("Pipeline error"),
        ):
            result = summarise("Test text")

            assert "error" in result
            assert result["summary"] == ""

    def test_summarise_truncates_long_text(self) -> None:
        """Test that summarise truncates very long text."""
        long_text = "word " * 2000  # More than 4096 chars
        mock_pipeline = MagicMock()
        mock_pipeline.return_value = [{"summary_text": "Summary."}]

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            return_value=mock_pipeline,
        ):
            result = summarise(long_text)

            # The input should be truncated
            call_args = mock_pipeline.call_args
            truncated_input = call_args[0][0]
            assert len(truncated_input) <= 4096

    def test_summarise_handles_empty_text(self) -> None:
        """Test that summarise handles empty text."""
        mock_pipeline = MagicMock()
        mock_pipeline.return_value = []

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            return_value=mock_pipeline,
        ):
            result = summarise("")

            assert result["summary"] == ""

    def test_summarise_strips_whitespace(self) -> None:
        """Test that summarise strips whitespace from result."""
        mock_pipeline = MagicMock()
        mock_pipeline.return_value = [
            {"summary_text": "  Summary with whitespace.  "}
        ]

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            return_value=mock_pipeline,
        ):
            result = summarise("Test text")

            assert result["summary"] == "Summary with whitespace."

    def test_summarise_handles_none_result(self) -> None:
        """Test that summarise handles None result from pipeline."""
        mock_pipeline = MagicMock()
        mock_pipeline.return_value = None

        with patch(
            "src.infrastructure.external_services.analytics.huggingface_client._get_pipeline",
            return_value=mock_pipeline,
        ):
            result = summarise("Test text")

            assert result["summary"] == ""
