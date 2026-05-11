import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.infrastructure.cache.redis_cache import (
    DEFAULT_TTL,
    BLOCKCHAIN_KEY_PREFIX,
    PORTFOLIO_AGGREGATE_KEY_PREFIX,
    RedisCache,
    create_redis_client,
)


class TestRedisCache:
    """Tests for the RedisCache class."""

    @pytest.fixture
    def mock_redis_client(self) -> MagicMock:
        """Create a mock Redis client."""
        return MagicMock()

    @pytest.fixture
    def cache(self, mock_redis_client: MagicMock) -> RedisCache:
        """Create a RedisCache with a mock client."""
        return RedisCache(client=mock_redis_client)

    @pytest.fixture
    def cache_no_client(self) -> RedisCache:
        """Create a RedisCache without a client."""
        return RedisCache(client=None)

    @pytest.mark.asyncio
    async def test_get_returns_parsed_json(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that get returns parsed JSON data."""
        mock_redis_client.get = AsyncMock(return_value='{"key": "value"}')

        result = await cache.get("test-key")

        assert result == {"key": "value"}
        mock_redis_client.get.assert_called_once_with("test-key")

    @pytest.mark.asyncio
    async def test_get_returns_none_when_not_found(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that get returns None when key not found."""
        mock_redis_client.get = AsyncMock(return_value=None)

        result = await cache.get("missing-key")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_returns_none_on_json_error(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that get returns None on JSON decode error."""
        mock_redis_client.get = AsyncMock(return_value="not valid json")

        result = await cache.get("test-key")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_returns_none_without_client(
        self, cache_no_client: RedisCache
    ) -> None:
        """Test that get returns None when no client is configured."""
        result = await cache_no_client.get("test-key")
        assert result is None

    @pytest.mark.asyncio
    async def test_set_serializes_and_stores(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that set serializes and stores data."""
        mock_redis_client.setex = AsyncMock()

        result = await cache.set("test-key", {"data": 123})

        assert result is True
        mock_redis_client.setex.assert_called_once()
        call_args = mock_redis_client.setex.call_args
        assert call_args[0][0] == "test-key"
        assert call_args[0][1] == DEFAULT_TTL

    @pytest.mark.asyncio
    async def test_set_with_custom_ttl(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that set uses custom TTL."""
        mock_redis_client.setex = AsyncMock()

        await cache.set("test-key", "value", ttl_seconds=600)

        call_args = mock_redis_client.setex.call_args
        assert call_args[0][1] == 600

    @pytest.mark.asyncio
    async def test_set_returns_false_on_error(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that set returns False on serialization error."""
        # Create a non-serializable object
        result = await cache.set("test-key", set([1, 2, 3]))

        assert result is False

    @pytest.mark.asyncio
    async def test_set_returns_false_without_client(
        self, cache_no_client: RedisCache
    ) -> None:
        """Test that set returns False when no client is configured."""
        result = await cache_no_client.set("test-key", "value")
        assert result is False

    @pytest.mark.asyncio
    async def test_delete_removes_keys(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that delete removes specified keys."""
        mock_redis_client.delete = AsyncMock()

        await cache.delete("key1", "key2", "key3")

        mock_redis_client.delete.assert_called_once_with("key1", "key2", "key3")

    @pytest.mark.asyncio
    async def test_delete_without_client(self, cache_no_client: RedisCache) -> None:
        """Test that delete handles no client gracefully."""
        # Should not raise
        await cache_no_client.delete("key1")

    @pytest.mark.asyncio
    async def test_delete_without_keys(self, cache: RedisCache) -> None:
        """Test that delete handles empty keys gracefully."""
        # Should not raise
        await cache.delete()

    @pytest.mark.asyncio
    async def test_delete_by_prefix(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test that delete_by_prefix removes all matching keys."""
        mock_redis_client.scan = AsyncMock(
            side_effect=[
                (100, ["prefix:key1", "prefix:key2"]),
                (0, ["prefix:key3"]),
            ]
        )
        mock_redis_client.delete = AsyncMock()

        await cache.delete_by_prefix("prefix")

        assert mock_redis_client.scan.call_count == 2
        assert mock_redis_client.delete.call_count == 2

    @pytest.mark.asyncio
    async def test_delete_by_prefix_no_matches(
        self, cache: RedisCache, mock_redis_client: MagicMock
    ) -> None:
        """Test delete_by_prefix when no keys match."""
        mock_redis_client.scan = AsyncMock(return_value=(0, []))
        mock_redis_client.delete = AsyncMock()

        await cache.delete_by_prefix("nonexistent")

        mock_redis_client.scan.assert_called_once()
        mock_redis_client.delete.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_by_prefix_without_client(
        self, cache_no_client: RedisCache
    ) -> None:
        """Test that delete_by_prefix handles no client gracefully."""
        # Should not raise
        await cache_no_client.delete_by_prefix("prefix")


class TestRedisCacheConstants:
    """Tests for RedisCache constants."""

    def test_default_ttl_value(self) -> None:
        """Test that DEFAULT_TTL is 300 seconds."""
        assert DEFAULT_TTL == 300

    def test_key_prefixes(self) -> None:
        """Test that key prefixes are defined."""
        assert BLOCKCHAIN_KEY_PREFIX == "blockchain:"
        assert PORTFOLIO_AGGREGATE_KEY_PREFIX == "portfolio:aggregate:"
