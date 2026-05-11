import pytest

from src.api.v1.mappers.portfolio_assembler import (
    assemble_holding,
    assemble_account,
    assemble_summary,
    assemble_history_point,
    assemble_portfolio,
)
from src.api.v1.schemas.portfolio_read_models import (
    HoldingView,
    AccountView,
    PortfolioSummaryView,
    HistoryPointView,
    PortfolioView,
)
from src.core.domain.entities.portfolio import Holding, Account, Portfolio
from src.core.domain.value_objects.portfolio import PortfolioSummary, HistoryPoint


class TestAssembleHolding:
    def test_assemble_holding_basic(self):
        holding = Holding(
            id="h-1",
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
        )
        
        result = assemble_holding(holding)
        
        assert isinstance(result, HoldingView)
        assert result.id == "h-1"
        assert result.symbol == "AAPL"
        assert result.name == "Apple Inc."
        assert result.quantity == 150.0
        assert result.price == 190.0
        assert result.costBasis == 160.0
        assert result.marketValue == 28500.0
        assert result.profit == 4500.0
        assert result.profitRate == 0.1875
        assert result.assetClass == "equity"
        assert result.riskLevel == "medium"


class TestAssembleAccount:
    def test_assemble_account_with_holdings(self):
        holding = Holding(
            id="h-1",
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
        )
        account = Account(
            id="acc-1",
            name="Brokerage",
            type="brokerage",
            currency="USD",
            balance=125000.0,
            today_change=1200.0,
            holdings=[holding],
        )
        
        result = assemble_account(account)
        
        assert isinstance(result, AccountView)
        assert result.id == "acc-1"
        assert result.name == "Brokerage"
        assert result.type == "brokerage"
        assert result.currency == "USD"
        assert result.balance == 125000.0
        assert result.todayChange == 1200.0
        assert len(result.holdings) == 1
        assert result.holdings[0].symbol == "AAPL"

    def test_assemble_account_empty_holdings(self):
        account = Account(
            id="acc-2",
            name="Savings",
            type="saving",
            currency="USD",
            balance=30000.0,
            today_change=5.0,
            holdings=[],
        )
        
        result = assemble_account(account)
        
        assert len(result.holdings) == 0


class TestAssembleSummary:
    def test_assemble_summary_basic(self):
        summary = PortfolioSummary(
            total_assets=155000.0,
            total_liabilities=3500.0,
            net_worth=151500.0,
            today_change=1205.0,
            week_change=3200.0,
        )
        
        result = assemble_summary(summary)
        
        assert isinstance(result, PortfolioSummaryView)
        assert result.totalAssets == 155000.0
        assert result.totalLiabilities == 3500.0
        assert result.netWorth == 151500.0
        assert result.todayChange == 1205.0
        assert result.weekChange == 3200.0


class TestAssembleHistoryPoint:
    def test_assemble_history_point_basic(self):
        point = HistoryPoint(date="2024-09-01", value=140000.0)
        
        result = assemble_history_point(point)
        
        assert isinstance(result, HistoryPointView)
        assert result.date == "2024-09-01"
        assert result.value == 140000.0


class TestAssemblePortfolio:
    def test_assemble_portfolio_basic(self):
        holding = Holding(
            id="h-1",
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
        )
        account = Account(
            id="acc-1",
            name="Brokerage",
            type="brokerage",
            currency="USD",
            balance=28500.0,
            today_change=4500.0,
            holdings=[holding],
        )
        summary = PortfolioSummary(
            total_assets=155000.0,
            total_liabilities=3500.0,
            net_worth=151500.0,
            today_change=1205.0,
            week_change=3200.0,
        )
        history = [
            HistoryPoint("2024-09-01", 140000.0),
            HistoryPoint("2024-09-02", 141200.0),
        ]
        portfolio = Portfolio(
            id="test-portfolio",
            owner_name="Test User",
            base_currency="USD",
            accounts=[account],
            summary=summary,
            history=history,
        )
        
        result = assemble_portfolio(portfolio)
        
        assert isinstance(result, PortfolioView)
        assert result.id == "test-portfolio"
        assert result.ownerName == "Test User"
        assert result.baseCurrency == "USD"
        assert len(result.accounts) == 1
        assert result.summary.netWorth == 151500.0
        assert len(result.history) == 2

    def test_assemble_portfolio_multiple_accounts(self):
        summary = PortfolioSummary(
            total_assets=100000.0,
            total_liabilities=0.0,
            net_worth=100000.0,
            today_change=0.0,
            week_change=0.0,
        )
        portfolio = Portfolio(
            id="multi",
            owner_name="Multi User",
            base_currency="USD",
            accounts=[],
            summary=summary,
            history=[],
        )
        
        result = assemble_portfolio(portfolio)
        
        assert len(result.accounts) == 0
        assert result.summary.netWorth == 100000.0
