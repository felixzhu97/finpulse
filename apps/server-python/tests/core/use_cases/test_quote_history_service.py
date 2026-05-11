from unittest.mock import MagicMock

import pytest

from src.core.application.use_cases.quote_history_service import QuoteHistoryService
from src.core.application.ports.repositories.realtime_quote_repository import IRealtimeQuoteRepository


class MockRealtimeQuoteRepository(IRealtimeQuoteRepository):
    def __init__(self, history: dict = None):
        self._history = history or {}

    def get_quotes(self, symbols):
        return {}

    def get_quote_history(self, symbols, minutes=5):
        result = {}
        for symbol in symbols:
            if symbol in self._history:
                result[symbol] = self._history[symbol]
        return result

    def upsert_quotes(self, quotes):
        pass

    def insert_ticks(self, quotes):
        pass


class TestQuoteHistoryService:
    def test_get_history_returns_history(self):
        history = {
            "AAPL": [
                [1700000000, 150.0],
                [1700000060, 150.5],
                [1700000120, 151.0],
            ],
        }
        repo = MockRealtimeQuoteRepository(history)
        service = QuoteHistoryService(repo)
        
        result = service.get_history(["AAPL"], minutes=5)
        
        assert "AAPL" in result
        assert len(result["AAPL"]) == 3

    def test_get_history_normalizes_symbols_to_uppercase(self):
        history = {
            "AAPL": [[1700000000, 150.0]],
        }
        repo = MockRealtimeQuoteRepository(history)
        service = QuoteHistoryService(repo)
        
        result = service.get_history(["aapl"], minutes=5)
        
        assert "AAPL" in result

    def test_get_history_empty_symbols(self):
        repo = MockRealtimeQuoteRepository({})
        service = QuoteHistoryService(repo)
        
        result = service.get_history([], minutes=5)
        
        assert result == {}

    def test_get_history_whitespace_symbols_filtered(self):
        history = {"AAPL": [[1700000000, 150.0]]}
        repo = MockRealtimeQuoteRepository(history)
        service = QuoteHistoryService(repo)
        
        result = service.get_history(["AAPL", "  ", "MSFT"], minutes=5)
        
        assert "AAPL" in result

    def test_get_history_custom_minutes(self):
        history = {"AAPL": [[1700000000, 150.0]]}
        repo = MockRealtimeQuoteRepository(history)
        service = QuoteHistoryService(repo)
        
        result = service.get_history(["AAPL"], minutes=30)
        
        assert "AAPL" in result

    def test_get_history_multiple_symbols(self):
        history = {
            "AAPL": [[1700000000, 150.0]],
            "MSFT": [[1700000000, 420.0]],
            "GOOGL": [[1700000000, 140.0]],
        }
        repo = MockRealtimeQuoteRepository(history)
        service = QuoteHistoryService(repo)
        
        result = service.get_history(["AAPL", "MSFT", "GOOGL"], minutes=5)
        
        assert len(result) == 3
        assert "AAPL" in result
        assert "MSFT" in result
        assert "GOOGL" in result
