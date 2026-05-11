import pytest

from src.api.v1.schemas.portfolio_read_models import (
    HoldingView,
    AccountView,
    PortfolioSummaryView,
    HistoryPointView,
    PortfolioView,
    RiskSummaryView,
    AssetAllocationItemView,
)


class TestHoldingView:
    def test_create_holding_view(self):
        view = HoldingView(
            id="h-1",
            symbol="AAPL",
            name="Apple Inc.",
            quantity=150.0,
            price=190.0,
            costBasis=160.0,
            marketValue=28500.0,
            profit=4500.0,
            profitRate=0.1875,
            assetClass="equity",
            riskLevel="medium",
        )
        
        assert view.id == "h-1"
        assert view.symbol == "AAPL"
        assert view.marketValue == 28500.0

    def test_holding_view_to_dict(self):
        view = HoldingView(
            id="h-1",
            symbol="AAPL",
            name="Apple",
            quantity=100.0,
            price=150.0,
            costBasis=140.0,
            marketValue=15000.0,
            profit=1000.0,
            profitRate=0.071,
            assetClass="equity",
            riskLevel="low",
        )
        
        data = view.model_dump()
        
        assert data["symbol"] == "AAPL"
        assert data["marketValue"] == 15000.0


class TestAccountView:
    def test_create_account_view(self):
        view = AccountView(
            id="acc-1",
            name="Brokerage",
            type="brokerage",
            currency="USD",
            balance=50000.0,
            todayChange=500.0,
            holdings=[],
        )
        
        assert view.id == "acc-1"
        assert view.balance == 50000.0
        assert len(view.holdings) == 0


class TestPortfolioSummaryView:
    def test_create_summary_view(self):
        view = PortfolioSummaryView(
            totalAssets=155000.0,
            totalLiabilities=3500.0,
            netWorth=151500.0,
            todayChange=1205.0,
            weekChange=3200.0,
        )
        
        assert view.totalAssets == 155000.0
        assert view.netWorth == 151500.0


class TestHistoryPointView:
    def test_create_history_point_view(self):
        view = HistoryPointView(date="2024-09-01", value=140000.0)
        
        assert view.date == "2024-09-01"
        assert view.value == 140000.0


class TestPortfolioView:
    def test_create_portfolio_view(self):
        view = PortfolioView(
            id="p-1",
            ownerName="Test User",
            baseCurrency="USD",
            accounts=[],
            summary=PortfolioSummaryView(
                totalAssets=100000.0,
                totalLiabilities=0.0,
                netWorth=100000.0,
                todayChange=0.0,
                weekChange=0.0,
            ),
            history=[],
        )
        
        assert view.id == "p-1"
        assert view.ownerName == "Test User"
        assert view.summary.netWorth == 100000.0


class TestRiskSummaryView:
    def test_create_risk_summary_view(self):
        view = RiskSummaryView(highRatio=0.35, topHoldingsConcentration=0.60)
        
        assert view.highRatio == 0.35
        assert view.topHoldingsConcentration == 0.60


class TestAssetAllocationItemView:
    def test_create_asset_allocation_item_view(self):
        view = AssetAllocationItemView(type="equity", value=75000.0)
        
        assert view.type == "equity"
        assert view.value == 75000.0
