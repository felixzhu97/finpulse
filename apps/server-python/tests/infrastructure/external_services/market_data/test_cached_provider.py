from typing import Dict
from unittest.mock import MagicMock

import pytest

from src.infrastructure.external_services.market_data.cached_provider import CachedMarketDataProvider


class TestCachedMarketDataProvider:
    """Tests for the CachedMarketDataProvider class."""

    @pytest.fixture
    def mock_cache(self) -> MagicMock:
        """Create a mock QuoteCache."""
        return MagicMock()

    @pytest.fixture
    def mock_inner(self) -> MagicMock:
        """Create a mock DatabaseMarketDataProvider."""
        return MagicMock()

    @pytest.fixture
    def provider(self, mock_cache: MagicMock, mock_inner: MagicMock) -> CachedMarketDataProvider:
        """Create a CachedMarketDataProvider with mocks."""
        return CachedMarketDataProvider(cache=mock_cache, inner=mock_inner)

    def test_get_quotes_returns_empty_for_empty_input(
        self, provider: CachedMarketDataProvider
    ) -> None:
        """Test that get_quotes returns empty dict for empty input."""
        result = provider.get_quotes([])
        assert result == {}

    def test_get_quotes_filters_whitespace(
        self, provider: CachedMarketDataProvider, mock_cache: MagicMock
    ) -> None:
        """Test that whitespace symbols are filtered out."""
        mock_cache.get_quotes.return_value = {}

        provider.get_quotes(["AAPL", "  ", "MSFT"])

        call_args = mock_cache.get_quotes.call_args[0][0]
        assert "  " not in call_args

    def test_get_quotes_uppercases_symbols(
        self, provider: CachedMarketDataProvider, mock_cache: MagicMock
    ) -> None:
        """Test that symbols are uppercased."""
        mock_cache.get_quotes.return_value = {}

        provider.get_quotes(["aapl"])

        call_args = mock_cache.get_quotes.call_args[0][0]
        assert "AAPL" in call_args

    def test_get_quotes_returns_cache_hit(
        self, provider: CachedMarketDataProvider, mock_cache: MagicMock
    ) -> None:
        """Test that cache hits are returned directly."""
        cached_quote = MagicMock()
        mock_cache.get_quotes.return_value = {"AAPL": cached_quote}

        result = provider.get_quotes(["AAPL"])

        assert "AAPL" in result
        assert result["AAPL"] is cached_quote

    def test_get_quotes_fetches_on_cache_miss(
        self,
        provider: CachedMarketDataProvider,
        mock_cache: MagicMock,
        mock_inner: MagicMock,
    ) -> None:
        """Test that cache misses fetch from database."""
        mock_cache.get_quotes.return_value = {}
        db_quote = MagicMock()
        mock_inner.get_quotes.return_value = {"AAPL": db_quote}

        result = provider.get_quotes(["AAPL"])

        mock_inner.get_quotes.assert_called_once()
        mock_cache.set_quotes.assert_called_once()
        assert "AAPL" in result

    def test_get_quotes_partial_cache_hit(
        self,
        provider: CachedMarketDataProvider,
        mock_cache: MagicMock,
        mock_inner: MagicMock,
    ) -> None:
        """Test partial cache hit scenario."""
        cached_quote = MagicMock()
        mock_cache.get_quotes.return_value = {"AAPL": cached_quote}
        db_quote = MagicMock()
        mock_inner.get_quotes.return_value = {"MSFT": db_quote}

        result = provider.get_quotes(["AAPL", "MSFT"])

        assert "AAPL" in result
        assert "MSFT" in result

    def test_get_quotes_no_db_result(
        self,
        provider: CachedMarketDataProvider,
        mock_cache: MagicMock,
        mock_inner: MagicMock,
    ) -> None:
        """Test when database returns no results."""
        mock_cache.get_quotes.return_value = {}
        mock_inner.get_quotes.return_value = {}

        result = provider.get_quotes(["AAPL"])

        assert result == {}

    def test_get_quotes_returns_dict_type(
        self,
        provider: CachedMarketDataProvider,
        mock_cache: MagicMock,
    ) -> None:
        """Test that result is a dictionary."""
        mock_cache.get_quotes.return_value = {"AAPL": MagicMock()}

        result = provider.get_quotes(["AAPL"])

        assert isinstance(result, dict)

    def test_get_quotes_with_generator(
        self,
        provider: CachedMarketDataProvider,
        mock_cache: MagicMock,
    ) -> None:
        """Test that get_quotes accepts a generator."""
        mock_cache.get_quotes.return_value = {}

        provider.get_quotes(x for x in ["AAPL", "MSFT"])

        mock_cache.get_quotes.assert_called_once()

    def test_get_quotes_strips_symbols(
        self,
        provider: CachedMarketDataProvider,
        mock_cache: MagicMock,
    ) -> None:
        """Test that symbols are stripped of whitespace."""
        mock_cache.get_quotes.return_value = {}

        provider.get_quotes([" AAPL ", " MSFT "])

        call_args = mock_cache.get_quotes.call_args[0][0]
        assert "AAPL" in call_args
        assert "MSFT" in call_args
