from src.core.domain.entities.analytics import RiskMetrics, Valuation
from src.infrastructure.database.models import RiskMetricsRow, ValuationRow


def _float(v):
    return float(v) if v is not None else None


def risk_metrics_row_to_entity(r: RiskMetricsRow) -> RiskMetrics:
    return RiskMetrics(
        metric_id=r.metric_id,
        portfolio_id=r.portfolio_id,
        as_of_date=r.as_of_date,
        risk_level=r.risk_level,
        volatility=_float(r.volatility),
        sharpe_ratio=_float(r.sharpe_ratio),
        var=_float(r.var),
        beta=_float(r.beta),
    )


def risk_metrics_entity_to_dict(e: RiskMetrics) -> dict:
    return {
        "metric_id": e.metric_id,
        "portfolio_id": e.portfolio_id,
        "as_of_date": e.as_of_date,
        "risk_level": e.risk_level,
        "volatility": e.volatility,
        "sharpe_ratio": e.sharpe_ratio,
        "var": e.var,
        "beta": e.beta,
    }


def valuation_row_to_entity(r: ValuationRow) -> Valuation:
    return Valuation(
        valuation_id=r.valuation_id,
        instrument_id=r.instrument_id,
        as_of_date=r.as_of_date,
        method=r.method,
        ev=_float(r.ev),
        equity_value=_float(r.equity_value),
        target_price=_float(r.target_price),
        multiples=_float(r.multiples),
        discount_rate=_float(r.discount_rate),
        growth_rate=_float(r.growth_rate),
    )


def valuation_entity_to_dict(e: Valuation) -> dict:
    return {
        "valuation_id": e.valuation_id,
        "instrument_id": e.instrument_id,
        "as_of_date": e.as_of_date,
        "method": e.method,
        "ev": e.ev,
        "equity_value": e.equity_value,
        "target_price": e.target_price,
        "multiples": e.multiples,
        "discount_rate": e.discount_rate,
        "growth_rate": e.growth_rate,
    }
