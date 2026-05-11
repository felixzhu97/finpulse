from datetime import date
from uuid import uuid4

import pytest

from src.core.domain.entities.analytics import RiskMetrics, Valuation


class TestRiskMetrics:
    def test_create_risk_metrics(self):
        metric_id = uuid4()
        portfolio_id = uuid4()
        as_of = date(2024, 1, 15)
        
        risk = RiskMetrics(
            metric_id=metric_id,
            portfolio_id=portfolio_id,
            as_of_date=as_of,
            risk_level="medium",
            volatility=0.15,
            sharpe_ratio=1.2,
            var=0.02,
            beta=1.1,
        )
        
        assert risk.metric_id == metric_id
        assert risk.portfolio_id == portfolio_id
        assert risk.as_of_date == as_of
        assert risk.risk_level == "medium"
        assert risk.volatility == 0.15
        assert risk.sharpe_ratio == 1.2
        assert risk.var == 0.02
        assert risk.beta == 1.1

    def test_risk_metrics_with_none_optional_fields(self):
        metric_id = uuid4()
        portfolio_id = uuid4()
        as_of = date(2024, 1, 15)
        
        risk = RiskMetrics(
            metric_id=metric_id,
            portfolio_id=portfolio_id,
            as_of_date=as_of,
            risk_level=None,
            volatility=None,
            sharpe_ratio=None,
            var=None,
            beta=None,
        )
        
        assert risk.risk_level is None
        assert risk.volatility is None
        assert risk.sharpe_ratio is None
        assert risk.var is None
        assert risk.beta is None


class TestValuation:
    def test_create_valuation(self):
        valuation_id = uuid4()
        instrument_id = uuid4()
        as_of = date(2024, 1, 15)
        
        valuation = Valuation(
            valuation_id=valuation_id,
            instrument_id=instrument_id,
            as_of_date=as_of,
            method="DCF",
            ev=1_000_000_000.0,
            equity_value=800_000_000.0,
            target_price=150.0,
            multiples=2.5,
            discount_rate=0.10,
            growth_rate=0.05,
        )
        
        assert valuation.valuation_id == valuation_id
        assert valuation.instrument_id == instrument_id
        assert valuation.as_of_date == as_of
        assert valuation.method == "DCF"
        assert valuation.ev == 1_000_000_000.0
        assert valuation.equity_value == 800_000_000.0
        assert valuation.target_price == 150.0
        assert valuation.multiples == 2.5
        assert valuation.discount_rate == 0.10
        assert valuation.growth_rate == 0.05

    def test_valuation_with_null_optional_fields(self):
        valuation_id = uuid4()
        instrument_id = uuid4()
        as_of = date(2024, 1, 15)
        
        valuation = Valuation(
            valuation_id=valuation_id,
            instrument_id=instrument_id,
            as_of_date=as_of,
            method=None,
            ev=None,
            equity_value=None,
            target_price=None,
            multiples=None,
            discount_rate=None,
            growth_rate=None,
        )
        
        assert valuation.method is None
        assert valuation.ev is None
        assert valuation.equity_value is None
