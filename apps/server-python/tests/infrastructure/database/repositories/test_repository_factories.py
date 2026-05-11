from unittest.mock import MagicMock
import pytest

from src.infrastructure.database.repositories.repository_factories import (
    risk_metrics_repo,
    valuation_repo,
)


class TestRepositoryFactories:
    def test_risk_metrics_repo_is_callable(self):
        mock_session = MagicMock()
        
        repo = risk_metrics_repo(mock_session)
        
        assert repo is not None

    def test_valuation_repo_is_callable(self):
        mock_session = MagicMock()
        
        repo = valuation_repo(mock_session)
        
        assert repo is not None
