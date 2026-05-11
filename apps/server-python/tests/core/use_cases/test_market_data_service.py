from unittest.mock import MagicMock

import pytest

from src.core.application.use_cases.market_data_service import MarketDataService
from src.core.application.ports.services.market_data_provider import IMarketDataProvider
from src.core.domain.entities.market_data import Quote


class MockMarketDataProvider(IMarketDataProvider):
    def __init__(self, quotes: dict = None):
        self._quotes = quotes or {}

    def get_quotes(self, symbols):
        result = {}
        for symbol in symbols:
            if symbol in self._quotes:
                result[symbol] = self._quotes[symbol]
        return result


class TestMarketDataService:
    def test_get_quotes_returns_quotes(self):
        quotes = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169),
            "MSFT": Quote(symbol="MSFT", price=420.0, change=-5.0, change_rate=-0.0118),
        }
        provider = MockMarketDataProvider(quotes)
        service = MarketDataService(provider)
        
        result = service.get_quotes(["AAPL", "MSFT"])
        
        assert "AAPL" in result
        assert "MSFT" in result
        assert result["AAPL"].price == 150.0
        assert result["MSFT"].price == 420.0

    def test_get_quotes_partial_match(self):
        quotes = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169),
        }
        provider = MockMarketDataProvider(quotes)
        service = MarketDataService(provider)
        
        result = service.get_quotes(["AAPL", "MSFT"])
        
        assert "AAPL" in result
        assert "MSFT" not in result

    def test_get_quotes_empty_symbols(self):
        provider = MockMarketDataProvider({})
        service = MarketDataService(provider)
        
        result = service.get_quotes([])
        
        assert result == {}

    def test_get_quotes_no_matches(self):
        provider = MockMarketDataProvider({})
        service = MarketDataService(provider)
        
        result = service.get_quotes(["UNKNOWN"])
        
        assert result == {}

    def test_get_quotes_preserves_quote_data(self):
        quote = Quote(
            symbol="TSLA",
            price=250.0,
            change=10.0,
            change_rate=0.04,
            volume=50000000.0,
            timestamp=1_700_000_000.0,
        )
        provider = MockMarketDataProvider({"TSLA": quote})
        service = MarketDataService(provider)
        
        result = service.get_quotes(["TSLA"])
        
        assert result["TSLA"].symbol == "TSLA"
        assert result["TSLA"].price == 250.0
        assert result["TSLA"].change == 10.0
        assert result["TSLA"].change_rate == 0.04
        assert result["TSLA"].volume == 50000000.0
        assert result["TSLA"].timestamp == 1_700_000_000.0
