from dataclasses import FrozenInstanceError
import pytest

from src.core.domain.value_objects.portfolio import (
    PortfolioSummary,
    HistoryPoint,
    RiskSummary,
    AssetAllocationItem,
)


class TestPortfolioSummary:
    def test_create_portfolio_summary(self):
        summary = PortfolioSummary(
            total_assets=155000.0,
            total_liabilities=3500.0,
            net_worth=151500.0,
            today_change=1205.0,
            week_change=3200.0,
        )
        
        assert summary.total_assets == 155000.0
        assert summary.total_liabilities == 3500.0
        assert summary.net_worth == 151500.0
        assert summary.today_change == 1205.0
        assert summary.week_change == 3200.0

    def test_portfolio_summary_is_frozen(self):
        summary = PortfolioSummary(
            total_assets=100.0,
            total_liabilities=10.0,
            net_worth=90.0,
            today_change=0.0,
            week_change=0.0,
        )
        
        with pytest.raises(FrozenInstanceError):
            summary.total_assets = 200.0

    def test_portfolio_summary_negative_values(self):
        summary = PortfolioSummary(
            total_assets=50000.0,
            total_liabilities=60000.0,
            net_worth=-10000.0,
            today_change=-500.0,
            week_change=-1000.0,
        )
        
        assert summary.net_worth < 0
        assert summary.today_change < 0

    def test_portfolio_summary_zero_values(self):
        summary = PortfolioSummary(
            total_assets=0.0,
            total_liabilities=0.0,
            net_worth=0.0,
            today_change=0.0,
            week_change=0.0,
        )
        
        assert summary.total_assets == 0.0
        assert summary.net_worth == 0.0


class TestHistoryPoint:
    def test_create_history_point(self):
        point = HistoryPoint(date="2024-09-01", value=140000.0)
        
        assert point.date == "2024-09-01"
        assert point.value == 140000.0

    def test_history_point_is_frozen(self):
        point = HistoryPoint(date="2024-01-01", value=100000.0)
        
        with pytest.raises(FrozenInstanceError):
            point.value = 200000.0


class TestRiskSummary:
    def test_create_risk_summary(self):
        risk = RiskSummary(
            high_ratio=0.35,
            top_holdings_concentration=0.60,
        )
        
        assert risk.high_ratio == 0.35
        assert risk.top_holdings_concentration == 0.60

    def test_risk_summary_is_frozen(self):
        risk = RiskSummary(high_ratio=0.0, top_holdings_concentration=0.0)
        
        with pytest.raises(FrozenInstanceError):
            risk.high_ratio = 0.5

    def test_risk_summary_zero_values(self):
        risk = RiskSummary(high_ratio=0.0, top_holdings_concentration=0.0)
        
        assert risk.high_ratio == 0.0
        assert risk.top_holdings_concentration == 0.0


class TestAssetAllocationItem:
    def test_create_asset_allocation_item(self):
        item = AssetAllocationItem(type="equity", value=75000.0)
        
        assert item.type == "equity"
        assert item.value == 75000.0

    def test_asset_allocation_item_is_frozen(self):
        item = AssetAllocationItem(type="cash", value=10000.0)
        
        with pytest.raises(FrozenInstanceError):
            item.value = 20000.0

    def test_asset_allocation_item_types(self):
        types = ["equity", "fixed_income", "cash", "crypto", "real_estate"]
        
        for asset_type in types:
            item = AssetAllocationItem(type=asset_type, value=5000.0)
            assert item.type == asset_type
