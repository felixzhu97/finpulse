from unittest.mock import MagicMock, AsyncMock, patch
import pytest

from src.core.application.use_cases.portfolio_service import PortfolioApplicationService
from src.core.domain.entities.portfolio import Portfolio, Account, Holding
from src.core.domain.value_objects.portfolio import PortfolioSummary, RiskSummary


class MockPortfolioRepository:
    def __init__(self, portfolio=None):
        self._portfolio = portfolio

    async def get(self, portfolio_id: str):
        return self._portfolio

    async def save(self, portfolio_id: str, data: dict) -> None:
        pass


class MockEventPublisher:
    def __init__(self):
        self.events = []

    def publish(self, event):
        self.events.append(event)


def create_test_portfolio():
    holdings = [
        Holding(
            id="h-aapl",
            symbol="AAPL",
            name="Apple Inc.",
            quantity=150.0,
            price=190.0,
            cost_basis=160.0,
            market_value=28500.0,
            profit=4500.0,
            profit_rate=0.1875,
            asset_class="equity",
            risk_level="medium",
        ),
        Holding(
            id="h-msft",
            symbol="MSFT",
            name="Microsoft Corp.",
            quantity=80.0,
            price=420.0,
            cost_basis=350.0,
            market_value=33600.0,
            profit=5600.0,
            profit_rate=0.2,
            asset_class="equity",
            risk_level="medium",
        ),
    ]
    brokerage = Account(
        id="acc-brokerage",
        name="Brokerage Account",
        type="brokerage",
        currency="USD",
        balance=62100.0,
        today_change=1200.0,
        holdings=holdings,
    )
    return Portfolio(
        id="test-portfolio",
        owner_name="Test User",
        base_currency="USD",
        accounts=[brokerage],
        summary=PortfolioSummary(62100, 0, 62100, 1200, 3200),
        history=[],
    )


class TestPortfolioServiceUnit:
    @pytest.mark.asyncio
    async def test_get_portfolio_returns_stored(self):
        portfolio = create_test_portfolio()
        repo = MockPortfolioRepository(portfolio)
        publisher = MockEventPublisher()
        service = PortfolioApplicationService(repo, publisher)
        
        result = await service.get_portfolio("test-portfolio")
        
        assert result.id == "test-portfolio"

    @pytest.mark.asyncio
    async def test_get_portfolio_returns_demo_when_not_found(self):
        repo = MockPortfolioRepository(None)
        publisher = MockEventPublisher()
        service = PortfolioApplicationService(repo, publisher)
        
        result = await service.get_portfolio("non-existent")
        
        assert result.id == "demo-portfolio"

    @pytest.mark.asyncio
    async def test_get_risk_summary_with_holdings(self):
        portfolio = create_test_portfolio()
        repo = MockPortfolioRepository(portfolio)
        publisher = MockEventPublisher()
        service = PortfolioApplicationService(repo, publisher)
        
        result = await service.get_risk_summary("test-portfolio")
        
        assert isinstance(result, RiskSummary)
        assert result.high_ratio == 0.0
        assert result.top_holdings_concentration == 1.0

    @pytest.mark.asyncio
    async def test_get_asset_allocation(self):
        portfolio = create_test_portfolio()
        repo = MockPortfolioRepository(portfolio)
        publisher = MockEventPublisher()
        service = PortfolioApplicationService(repo, publisher)
        
        result = await service.get_asset_allocation_by_account_type("test-portfolio")
        
        assert len(result) == 1
        assert result[0].type == "brokerage"

    @pytest.mark.asyncio
    async def test_seed_portfolio_invalid_payload(self):
        repo = MockPortfolioRepository(None)
        publisher = MockEventPublisher()
        service = PortfolioApplicationService(repo, publisher)
        
        result = await service.seed_portfolio("not a dict")
        assert result is False
        
        result = await service.seed_portfolio({})
        assert result is False

    @pytest.mark.asyncio
    async def test_seed_portfolio_valid(self):
        repo = MockPortfolioRepository(None)
        publisher = MockEventPublisher()
        service = PortfolioApplicationService(repo, publisher)
        payload = {
            "id": "new",
            "ownerName": "Test",
            "baseCurrency": "USD",
            "accounts": [],
            "summary": {"totalAssets": 100, "totalLiabilities": 0, "netWorth": 100, "todayChange": 0, "weekChange": 0},
            "history": [],
        }
        
        result = await service.seed_portfolio(payload)
        
        assert result is True
        assert len(publisher.events) == 1


class TestPortfolioServiceRiskCalculations:
    @pytest.mark.asyncio
    async def test_high_risk_ratio(self):
        holdings = [
            Holding("h-btc", "BTC", "Bitcoin", 1, 50000, 40000, 50000, 10000, 0.25, "crypto", "high"),
        ]
        account = Account("acc", "Crypto", "brokerage", "USD", 50000, 0, holdings)
        portfolio = Portfolio("high-risk", "User", "USD", [account],
                            PortfolioSummary(50000, 0, 50000, 0, 0), [])
        repo = MockPortfolioRepository(portfolio)
        service = PortfolioApplicationService(repo, MockEventPublisher())
        
        result = await service.get_risk_summary("high-risk")
        
        assert result.high_ratio == 1.0
