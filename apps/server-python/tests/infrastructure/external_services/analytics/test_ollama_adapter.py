from unittest.mock import patch, MagicMock

import pytest

from src.infrastructure.external_services.analytics.ollama_adapter import OllamaGenerateAdapter


class TestOllamaAdapter:
    """Tests for the OllamaGenerateAdapter class."""

    @pytest.fixture
    def adapter(self) -> OllamaGenerateAdapter:
        return OllamaGenerateAdapter()

    def test_generate_calls_ollama_impl(self, adapter: OllamaGenerateAdapter) -> None:
        """Test that generate calls the underlying ollama implementation."""
        with patch(
            "src.infrastructure.external_services.analytics.ollama_adapter.ollama_generate_impl"
        ) as mock_impl:
            mock_impl.return_value = {
                "response": "test response",
                "model": "llama2",
                "done": True,
            }

            result = adapter.generate("Test prompt")

            mock_impl.assert_called_once_with(prompt="Test prompt", model=None)
            assert result["response"] == "test response"

    def test_generate_with_custom_model(self, adapter: OllamaGenerateAdapter) -> None:
        """Test generate with a custom model."""
        with patch(
            "src.infrastructure.external_services.analytics.ollama_adapter.ollama_generate_impl"
        ) as mock_impl:
            mock_impl.return_value = {
                "response": "custom response",
                "model": "custom-model",
                "done": True,
            }

            result = adapter.generate("Test prompt", model="custom-model")

            mock_impl.assert_called_once_with(prompt="Test prompt", model="custom-model")
            assert result["model"] == "custom-model"
