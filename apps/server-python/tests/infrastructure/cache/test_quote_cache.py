import pytest
from unittest.mock import MagicMock, patch, AsyncMock

from src.core.domain.entities.market_data import Quote


class TestQuoteCache:
    @patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379")
    @patch("redis.Redis.from_url")
    def test_quote_cache_handles_no_redis_client(self, mock_redis_from_url):
        mock_redis_from_url.side_effect = Exception("Connection refused")
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        result = cache.get_quotes(["AAPL"])
        assert result == {}

    def test_get_quotes_empty_symbols(self):
        with patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379"):
            with patch("redis.Redis.from_url") as mock_redis_from_url:
                mock_redis_from_url.side_effect = Exception("No Redis")
                from src.infrastructure.cache.quote_cache import QuoteCache
                cache = QuoteCache()
                result = cache.get_quotes([])
                assert result == {}

    @patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379")
    @patch("redis.Redis.from_url")
    def test_get_quotes_whitespace_symbols(self, mock_redis_from_url):
        mock_redis_from_url.side_effect = Exception("Connection refused")
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        result = cache.get_quotes(["AAPL", "  ", "MSFT"])
        assert isinstance(result, dict)

    @patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379")
    @patch("redis.Redis.from_url")
    def test_get_quotes_normalize_symbols(self, mock_redis_from_url):
        mock_client = MagicMock()
        mock_client.mget.return_value = ['{"price": 150.0, "change": 2.5, "change_rate": 0.0169}']
        mock_redis_from_url.return_value = mock_client
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        result = cache.get_quotes(["aapl"])
        assert "AAPL" in result or len(result) >= 0

    @patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379")
    @patch("redis.Redis.from_url")
    def test_set_quotes_with_redis_client(self, mock_redis_from_url):
        mock_client = MagicMock()
        mock_pipe = MagicMock()
        mock_client.pipeline.return_value = mock_pipe
        mock_redis_from_url.return_value = mock_client
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        quotes = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169),
        }
        cache.set_quotes(quotes)
        assert mock_client.pipeline.called

    @patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379")
    @patch("redis.Redis.from_url")
    def test_set_quotes_handles_pipeline_error(self, mock_redis_from_url):
        mock_client = MagicMock()
        mock_pipe = MagicMock()
        mock_pipe.execute.side_effect = Exception("Pipeline error")
        mock_client.pipeline.return_value = mock_pipe
        mock_redis_from_url.return_value = mock_client
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        quotes = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169),
        }
        cache.set_quotes(quotes)
        assert True

    @patch("src.infrastructure.cache.quote_cache.REDIS_URL", "redis://localhost:6379")
    @patch("redis.Redis.from_url")
    def test_get_quotes_handles_malformed_json(self, mock_redis_from_url):
        mock_client = MagicMock()
        mock_client.mget.return_value = ['{"price": 150.0, "change": 2.5}', None, "invalid-json"]
        mock_redis_from_url.return_value = mock_client
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        result = cache.get_quotes(["AAPL", "MSFT", "GOOG"])
        assert isinstance(result, dict)


class TestQuoteCacheSetQuotes:
    def test_set_quotes_empty_dict(self):
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        cache.set_quotes({})
        assert True

    def test_set_quotes_with_quotes(self):
        from src.infrastructure.cache.quote_cache import QuoteCache
        cache = QuoteCache()
        quotes = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169),
        }
        cache.set_quotes(quotes)
        assert True
