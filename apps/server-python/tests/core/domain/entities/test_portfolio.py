import pytest

from src.core.domain.entities.portfolio import Holding, Account, Portfolio
from src.core.domain.value_objects.portfolio import PortfolioSummary, HistoryPoint


class TestHolding:
    def test_create_holding(self):
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
        
        assert holding.id == "h-1"
        assert holding.symbol == "AAPL"
        assert holding.name == "Apple Inc."
        assert holding.quantity == 150.0
        assert holding.price == 190.0
        assert holding.cost_basis == 160.0
        assert holding.market_value == 28500.0
        assert holding.profit == 4500.0
        assert holding.profit_rate == 0.1875
        assert holding.asset_class == "equity"
        assert holding.risk_level == "medium"

    def test_holding_with_zero_values(self):
        holding = Holding(
            id="h-cash",
            symbol="CASH",
            name="Cash",
            quantity=10000.0,
            price=1.0,
            cost_basis=1.0,
            market_value=10000.0,
            profit=0.0,
            profit_rate=0.0,
            asset_class="cash",
            risk_level="low",
        )
        
        assert holding.profit == 0.0
        assert holding.profit_rate == 0.0
        assert holding.risk_level == "low"


class TestAccount:
    def test_create_account_with_holdings(self):
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
            name="Brokerage Account",
            type="brokerage",
            currency="USD",
            balance=125000.0,
            today_change=1200.0,
            holdings=[holding],
        )
        
        assert account.id == "acc-1"
        assert account.name == "Brokerage Account"
        assert account.type == "brokerage"
        assert account.currency == "USD"
        assert account.balance == 125000.0
        assert account.today_change == 1200.0
        assert len(account.holdings) == 1
        assert account.holdings[0].symbol == "AAPL"

    def test_create_account_with_empty_holdings(self):
        account = Account(
            id="acc-2",
            name="Credit Card",
            type="creditCard",
            currency="USD",
            balance=-3500.0,
            today_change=0.0,
            holdings=[],
        )
        
        assert len(account.holdings) == 0
        assert account.balance < 0


class TestPortfolio:
    def test_create_portfolio(self):
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
            name="Brokerage Account",
            type="brokerage",
            currency="USD",
            balance=125000.0,
            today_change=1200.0,
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
            id="portfolio-1",
            owner_name="Test User",
            base_currency="USD",
            accounts=[account],
            summary=summary,
            history=history,
        )
        
        assert portfolio.id == "portfolio-1"
        assert portfolio.owner_name == "Test User"
        assert portfolio.base_currency == "USD"
        assert len(portfolio.accounts) == 1
        assert portfolio.summary.net_worth == 151500.0
        assert len(portfolio.history) == 2

    def test_portfolio_with_multiple_accounts(self):
        summary = PortfolioSummary(
            total_assets=155000.0,
            total_liabilities=3500.0,
            net_worth=151500.0,
            today_change=1205.0,
            week_change=3200.0,
        )
        
        brokerage = Account(
            id="acc-brokerage",
            name="Brokerage",
            type="brokerage",
            currency="USD",
            balance=125000.0,
            today_change=1200.0,
            holdings=[],
        )
        saving = Account(
            id="acc-saving",
            name="Savings",
            type="saving",
            currency="USD",
            balance=30000.0,
            today_change=5.0,
            holdings=[],
        )
        credit = Account(
            id="acc-credit",
            name="Credit Card",
            type="creditCard",
            currency="USD",
            balance=-3500.0,
            today_change=0.0,
            holdings=[],
        )
        
        portfolio = Portfolio(
            id="multi-account",
            owner_name="Multi Account User",
            base_currency="USD",
            accounts=[brokerage, saving, credit],
            summary=summary,
            history=[],
        )
        
        assert len(portfolio.accounts) == 3
        assert sum(a.balance for a in portfolio.accounts) == 151500.0
