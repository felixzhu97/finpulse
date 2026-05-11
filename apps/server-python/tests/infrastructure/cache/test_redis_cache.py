import pytest
from unittest.mock import MagicMock, AsyncMock

from src.infrastructure.cache.redis_cache import RedisCache


class TestRedisCache:
    @pytest.mark.asyncio
    async def test_get_returns_none_when_no_client(self):
        cache = RedisCache(None)
        result = await cache.get("test-key")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_returns_none_when_not_found(self):
        mock_client = MagicMock()
        mock_client.get = AsyncMock(return_value=None)
        cache = RedisCache(mock_client)
        result = await cache.get("test-key")
        assert result is None
        mock_client.get.assert_called_once_with("test-key")

    @pytest.mark.asyncio
    async def test_get_returns_data_when_found(self):
        mock_client = MagicMock()
        mock_client.get = AsyncMock(return_value='{"key": "value"}')
        cache = RedisCache(mock_client)
        result = await cache.get("test-key")
        assert result == {"key": "value"}

    @pytest.mark.asyncio
    async def test_set_stores_data(self):
        mock_client = MagicMock()
        mock_client.setex = AsyncMock(return_value=True)
        cache = RedisCache(mock_client)
        result = await cache.set("test-key", {"key": "value"}, ttl_seconds=300)
        assert result is True
        mock_client.setex.assert_called_once()

    @pytest.mark.asyncio
    async def test_set_with_no_client(self):
        cache = RedisCache(None)
        result = await cache.set("test-key", {"data": "value"})
        assert result is False

    @pytest.mark.asyncio
    async def test_delete_removes_key(self):
        mock_client = MagicMock()
        mock_client.delete = AsyncMock(return_value=1)
        cache = RedisCache(mock_client)
        await cache.delete("test-key")
        mock_client.delete.assert_called_once_with("test-key")

    @pytest.mark.asyncio
    async def test_delete_with_no_client(self):
        cache = RedisCache(None)
        await cache.delete("test-key")
        assert True

    @pytest.mark.asyncio
    async def test_delete_by_prefix_no_client(self):
        cache = RedisCache(None)
        await cache.delete_by_prefix("test:")
        assert True

    @pytest.mark.asyncio
    async def test_delete_by_prefix(self):
        mock_client = MagicMock()
        mock_client.scan = AsyncMock(side_effect=[(0, ["test:key1", "test:key2"])])
        mock_client.delete = AsyncMock(return_value=2)
        cache = RedisCache(mock_client)
        await cache.delete_by_prefix("test:")
        assert True
