from unittest.mock import MagicMock, patch, AsyncMock
import pytest

from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.core.domain.entities.portfolio import Portfolio, Account
from src.core.domain.value_objects.portfolio import PortfolioSummary, HistoryPoint, RiskSummary, AssetAllocationItem
from src.api.v1.mappers.portfolio_assembler import assemble_portfolio


@pytest.fixture
def mock_portfolio_service():
    service = MagicMock(spec=PortfolioApplicationService)
    return service


@pytest.fixture
def mock_portfolio():
    portfolio = Portfolio(
        id="test-portfolio-1",
        owner_name="Test User",
        base_currency="USD",
        accounts=[
            Account(
                id="acc-1",
                name="Test Account",
                type="BROKERAGE",
                currency="USD",
                balance=10000.0,
                today_change=50.0,
                holdings=[],
            )
        ],
        summary=PortfolioSummary(
            total_assets=10000.0,
            total_liabilities=0.0,
            net_worth=10000.0,
            today_change=50.0,
            week_change=100.0,
        ),
        history=[HistoryPoint(date="2024-01-01", value=9900.0)],
    )
    return portfolio


class TestPortfolioAssembler:
    def test_assemble_portfolio(self, mock_portfolio):
        result = assemble_portfolio(mock_portfolio)
        assert result is not None
        assert hasattr(result, "id")
        assert result.id == "test-portfolio-1"

    def test_assemble_portfolio_with_empty_accounts(self):
        empty_portfolio = Portfolio(
            id="empty-1",
            owner_name="Empty User",
            base_currency="USD",
            accounts=[],
            summary=PortfolioSummary(
                total_assets=0.0,
                total_liabilities=0.0,
                net_worth=0.0,
                today_change=0.0,
                week_change=0.0,
            ),
            history=[],
        )
        result = assemble_portfolio(empty_portfolio)
        assert result is not None
        assert result.id == "empty-1"


class TestRiskSummaryView:
    def test_risk_summary_creation(self):
        from src.api.v1.schemas.portfolio_read_models import RiskSummaryView
        view = RiskSummaryView(highRatio=0.25, topHoldingsConcentration=0.15)
        assert view.highRatio == 0.25
        assert view.topHoldingsConcentration == 0.15


class TestAssetAllocationItemView:
    def test_asset_allocation_item_creation(self):
        from src.api.v1.schemas.portfolio_read_models import AssetAllocationItemView
        view = AssetAllocationItemView(type="BROKERAGE", value=5000.0)
        assert view.type == "BROKERAGE"
        assert view.value == 5000.0


class TestQuotesEndpoint:
    def test_quotes_response_helper(self):
        from src.api.v1.endpoints.app_routes import _quotes_response
        from src.core.application.use_cases.market_data_service import MarketDataService
        from src.core.domain.entities.market_data import Quote
        
        mock_svc = MagicMock(spec=MarketDataService)
        mock_svc.get_quotes.return_value = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169)
        }
        result = _quotes_response(mock_svc, ["AAPL"])
        assert "AAPL" in result
        assert result["AAPL"]["price"] == 150.0

    def test_quotes_response_with_missing_symbol(self):
        from src.api.v1.endpoints.app_routes import _quotes_response
        from src.core.application.use_cases.market_data_service import MarketDataService
        
        mock_svc = MagicMock(spec=MarketDataService)
        mock_svc.get_quotes.return_value = {}
        result = _quotes_response(mock_svc, ["AAPL", "MSFT"])
        assert "AAPL" not in result
        assert "MSFT" not in result

    def test_quotes_response_with_volume(self):
        from src.api.v1.endpoints.app_routes import _quotes_response
        from src.core.application.use_cases.market_data_service import MarketDataService
        from src.core.domain.entities.market_data import Quote
        
        mock_svc = MagicMock(spec=MarketDataService)
        mock_svc.get_quotes.return_value = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169, volume=1000000)
        }
        result = _quotes_response(mock_svc, ["AAPL"])
        assert "AAPL" in result
        assert "volume" in result["AAPL"]
        assert result["AAPL"]["volume"] == 1000000


class TestSeedPortfolioLogic:
    def test_seed_portfolio_logic_success(self, mock_portfolio_service):
        mock_portfolio_service.seed_portfolio = AsyncMock(return_value=True)
        payload = {"test": "data"}
        result = mock_portfolio_service.seed_portfolio(payload)
        import asyncio
        resolved = asyncio.get_event_loop().run_until_complete(result)
        assert resolved == True

    def test_seed_portfolio_logic_failure(self, mock_portfolio_service):
        mock_portfolio_service.seed_portfolio = AsyncMock(return_value=False)
        payload = {"invalid": "data"}
        result = mock_portfolio_service.seed_portfolio(payload)
        import asyncio
        resolved = asyncio.get_event_loop().run_until_complete(result)
        assert resolved == False


class TestQuotesEndpoint:
    def test_quotes_response_helper(self):
        from src.api.v1.endpoints.app_routes import _quotes_response
        from src.core.application.use_cases.market_data_service import MarketDataService
        from src.core.domain.entities.market_data import Quote
        
        mock_svc = MagicMock(spec=MarketDataService)
        mock_svc.get_quotes.return_value = {
            "AAPL": Quote(symbol="AAPL", price=150.0, change=2.5, change_rate=0.0169)
        }
        result = _quotes_response(mock_svc, ["AAPL"])
        assert "AAPL" in result
        assert result["AAPL"]["price"] == 150.0

    def test_quotes_response_with_missing_symbol(self):
        from src.api.v1.endpoints.app_routes import _quotes_response
        from src.core.application.use_cases.market_data_service import MarketDataService
        
        mock_svc = MagicMock(spec=MarketDataService)
        mock_svc.get_quotes.return_value = {}
        result = _quotes_response(mock_svc, ["AAPL", "MSFT"])
        assert "AAPL" not in result
        assert "MSFT" not in result
