import pytest
from unittest.mock import MagicMock, patch, PropertyMock

from src.infrastructure.database.repositories.realtime_quote_repository import RealtimeQuoteRepository
from src.core.domain.entities.market_data import Quote


class TestRealtimeQuoteRepository:
    @patch("src.infrastructure.database.repositories.realtime_quote_repository.create_engine")
    @patch("src.infrastructure.database.repositories.realtime_quote_repository.DATABASE_URL", "postgresql://test:test@localhost/test")
    def test_get_quotes_with_empty_symbols(self, mock_create_engine):
        mock_engine = MagicMock()
        mock_session = MagicMock()
        mock_engine.connect.return_value.__enter__ = MagicMock(return_value=mock_session)
        mock_engine.connect.return_value.__exit__ = MagicMock(return_value=None)
        mock_create_engine.return_value = mock_engine
        with patch("sqlalchemy.orm.sessionmaker") as mock_session_maker:
            mock_session_maker.return_value.return_value.__enter__ = MagicMock(return_value=mock_session)
            mock_session_maker.return_value.return_value.__exit__ = MagicMock(return_value=None)
            repo = RealtimeQuoteRepository()
            result = repo.get_quotes([])
            assert result == {}

    @patch("src.infrastructure.database.repositories.realtime_quote_repository.create_engine")
    @patch("src.infrastructure.database.repositories.realtime_quote_repository.DATABASE_URL", "postgresql://test:test@localhost/test")
    def test_get_quote_history_with_empty_symbols(self, mock_create_engine):
        mock_create_engine.return_value = MagicMock()
        with patch("sqlalchemy.orm.sessionmaker") as mock_session_maker:
            repo = RealtimeQuoteRepository()
            result = repo.get_quote_history([])
            assert result == {}

    @patch("src.infrastructure.database.repositories.realtime_quote_repository.create_engine")
    @patch("src.infrastructure.database.repositories.realtime_quote_repository.DATABASE_URL", "postgresql://test:test@localhost/test")
    def test_upsert_quotes_empty_dict(self, mock_create_engine):
        mock_create_engine.return_value = MagicMock()
        with patch("sqlalchemy.orm.sessionmaker") as mock_session_maker:
            repo = RealtimeQuoteRepository()
            repo.upsert_quotes({})
            assert True

    @patch("src.infrastructure.database.repositories.realtime_quote_repository.create_engine")
    @patch("src.infrastructure.database.repositories.realtime_quote_repository.DATABASE_URL", "postgresql://test:test@localhost/test")
    def test_insert_ticks_empty_dict(self, mock_create_engine):
        mock_create_engine.return_value = MagicMock()
        with patch("sqlalchemy.orm.sessionmaker") as mock_session_maker:
            repo = RealtimeQuoteRepository()
            repo.insert_ticks({})
            assert True

    @patch("src.infrastructure.database.repositories.realtime_quote_repository.create_engine")
    @patch("src.infrastructure.database.repositories.realtime_quote_repository.DATABASE_URL", "postgresql://test:test@localhost/test")
    def test_get_quotes_with_mock_session(self, mock_create_engine):
        mock_engine = MagicMock()
        mock_session = MagicMock()
        mock_session.execute.return_value.all.return_value = []
        mock_engine.connect.return_value.__enter__ = MagicMock(return_value=mock_session)
        mock_engine.connect.return_value.__exit__ = MagicMock(return_value=None)
        mock_create_engine.return_value = mock_engine
        
        with patch("sqlalchemy.orm.sessionmaker") as mock_session_maker:
            mock_session_factory = MagicMock()
            mock_session_factory.return_value.__enter__ = MagicMock(return_value=mock_session)
            mock_session_factory.return_value.__exit__ = MagicMock(return_value=None)
            mock_session_maker.return_value = mock_session_factory
            repo = RealtimeQuoteRepository()
            result = repo.get_quotes(["AAPL"])
            assert result == {}
