from unittest.mock import patch, MagicMock

import pytest

from src.infrastructure.external_services.analytics.ollama_client import generate


class TestOllamaClient:
    """Tests for the Ollama client functions."""

    def test_generate_returns_response(self) -> None:
        """Test that generate returns a response dictionary."""
        mock_response = {
            "response": "This is a generated response.",
            "model": "llama2",
            "done": True,
        }

        with patch("src.infrastructure.external_services.analytics.ollama_client.httpx.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = mock_response
            mock_client.post.return_value = mock_response_obj
            mock_client.__enter__ = MagicMock(return_value=mock_client)
            mock_client.__exit__ = MagicMock(return_value=None)
            mock_client_class.return_value = mock_client

            result = generate("Test prompt")

            assert "response" in result
            assert result["model"] == "llama2"
            assert result["done"] is True

    def test_generate_uses_default_model(self) -> None:
        """Test that generate uses the default model when not specified."""
        with patch("src.infrastructure.external_services.analytics.ollama_client.httpx.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = {
                "response": "test",
                "model": "llama2",
                "done": True,
            }
            mock_client.post.return_value = mock_response_obj
            mock_client.__enter__ = MagicMock(return_value=mock_client)
            mock_client.__exit__ = MagicMock(return_value=None)
            mock_client_class.return_value = mock_client

            result = generate("Test prompt")

            # Verify the model in the request
            call_args = mock_client.post.call_args
            assert "model" in call_args[1]["json"]
            assert call_args[1]["json"]["model"] == "llama2"

    def test_generate_with_custom_model(self) -> None:
        """Test generate with a custom model."""
        with patch("src.infrastructure.external_services.analytics.ollama_client.httpx.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = {
                "response": "test",
                "model": "custom-model",
                "done": True,
            }
            mock_client.post.return_value = mock_response_obj
            mock_client.__enter__ = MagicMock(return_value=mock_client)
            mock_client.__exit__ = MagicMock(return_value=None)
            mock_client_class.return_value = mock_client

            result = generate("Test prompt", model="custom-model")

            call_args = mock_client.post.call_args
            assert call_args[1]["json"]["model"] == "custom-model"

    def test_generate_handles_stream_false(self) -> None:
        """Test that generate handles stream parameter."""
        with patch("src.infrastructure.external_services.analytics.ollama_client.httpx.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = {
                "response": "test",
                "model": "llama2",
                "done": True,
            }
            mock_client.post.return_value = mock_response_obj
            mock_client.__enter__ = MagicMock(return_value=mock_client)
            mock_client.__exit__ = MagicMock(return_value=None)
            mock_client_class.return_value = mock_client

            result = generate("Test prompt", stream=False)

            call_args = mock_client.post.call_args
            assert call_args[1]["json"]["stream"] is False

    def test_generate_handles_missing_response(self) -> None:
        """Test generate handles missing response field."""
        with patch("src.infrastructure.external_services.analytics.ollama_client.httpx.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = {
                "model": "llama2",
                "done": True,
            }
            mock_client.post.return_value = mock_response_obj
            mock_client.__enter__ = MagicMock(return_value=mock_client)
            mock_client.__exit__ = MagicMock(return_value=None)
            mock_client_class.return_value = mock_client

            result = generate("Test prompt")

            assert result["response"] == ""

    def test_generate_handles_missing_model(self) -> None:
        """Test generate handles missing model in response."""
        with patch("src.infrastructure.external_services.analytics.ollama_client.httpx.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_response_obj = MagicMock()
            mock_response_obj.json.return_value = {
                "response": "test",
                "done": True,
            }
            mock_client.post.return_value = mock_response_obj
            mock_client.__enter__ = MagicMock(return_value=mock_client)
            mock_client.__exit__ = MagicMock(return_value=None)
            mock_client_class.return_value = mock_client

            result = generate("Test prompt")

            # Should use default model
            assert result["model"] == "llama2"
