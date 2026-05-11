from unittest.mock import MagicMock
import pytest

from src.infrastructure.config.container import (
    portfolio_service,
    market_data_service,
    quote_history_service,
    analytics_service,
)


class TestContainer:
    def test_portfolio_service_factory(self):
        mock_session = MagicMock()
        mock_redis = MagicMock()
        
        service = portfolio_service(mock_session, mock_redis)
        
        assert service is not None

    def test_market_data_service_factory(self):
        mock_repo = MagicMock()
        
        service = market_data_service(mock_repo)
        
        assert service is not None

    def test_quote_history_service_factory(self):
        mock_repo = MagicMock()
        
        service = quote_history_service(mock_repo)
        
        assert service is not None

    def test_analytics_service_factory(self):
        service = analytics_service()
        
        assert service is not None
