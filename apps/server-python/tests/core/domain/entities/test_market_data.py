import pytest

from src.core.domain.entities.market_data import Quote


class TestQuote:
    def test_create_quote_with_required_fields(self):
        quote = Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169)
        
        assert quote.symbol == "AAPL"
        assert quote.price == 150.0
        assert quote.change == 2.5
        assert quote.change_rate == 0.0169
        assert quote.volume is None
        assert quote.timestamp == 0.0

    def test_create_quote_with_all_fields(self):
        quote = Quote(
            symbol="MSFT",
            price=420.0,
            change=-5.0,
            change_rate=-0.0118,
            volume=10_000_000.0,
            timestamp=1_700_000_000.0,
        )
        
        assert quote.symbol == "MSFT"
        assert quote.price == 420.0
        assert quote.change == -5.0
        assert quote.change_rate == -0.0118
        assert quote.volume == 10_000_000.0
        assert quote.timestamp == 1_700_000_000.0

    def test_quote_is_dataclass(self):
        quote1 = Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169)
        quote2 = Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169)
        
        assert quote1 == quote2

    def test_quote_price_types(self):
        quote_int = Quote(symbol="A", price=100, change=1, change_rate=0.01)
        assert isinstance(quote_int.price, int)
        
        quote_float = Quote(symbol="B", price=100.5, change=1.5, change_rate=0.015)
        assert isinstance(quote_float.price, float)
