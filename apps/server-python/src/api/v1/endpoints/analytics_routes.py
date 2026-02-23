from datetime import date
from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from src.api.v1.endpoints.crud_helpers import register_crud
from src.api.v1.schemas import (
    RiskMetricsCreate,
    RiskMetricsResponse,
    ValuationCreate,
    ValuationResponse,
    VarBatchComputeRequest,
    VarComputeRequest,
)
from src.api.dependencies import (
    get_analytics_service,
    get_clickhouse_analytics,
    get_model_loader,
    get_portfolio_history_repo,
    get_risk_metrics_repo,
    get_valuation_repo,
)
from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.domain.entities.analytics import RiskMetrics, Valuation


def _values_to_returns(values: list[float]) -> list[float]:
    return [
        (values[i] - values[i - 1]) / values[i - 1]
        for i in range(1, len(values))
        if values[i - 1] and values[i - 1] != 0
    ]


def _risk_metrics_to_response(e: RiskMetrics) -> RiskMetricsResponse:
    return RiskMetricsResponse(
        metric_id=e.metric_id,
        portfolio_id=e.portfolio_id,
        as_of_date=e.as_of_date,
        risk_level=e.risk_level,
        volatility=e.volatility,
        sharpe_ratio=e.sharpe_ratio,
        var=e.var,
        beta=e.beta,
    )


def _valuation_to_response(e: Valuation) -> ValuationResponse:
    return ValuationResponse(
        valuation_id=e.valuation_id,
        instrument_id=e.instrument_id,
        as_of_date=e.as_of_date,
        method=e.method,
        ev=e.ev,
        equity_value=e.equity_value,
        target_price=e.target_price,
        multiples=e.multiples,
        discount_rate=e.discount_rate,
        growth_rate=e.growth_rate,
    )


def _as_of(b):
    return b.as_of_date or date.today()


def register(router: APIRouter) -> None:
    register_crud(
        router, "risk-metrics", "metric_id",
        RiskMetricsCreate, RiskMetricsResponse, get_risk_metrics_repo,
        _risk_metrics_to_response,
        lambda b: RiskMetrics(metric_id=uuid4(), portfolio_id=b.portfolio_id, as_of_date=_as_of(b), risk_level=b.risk_level, volatility=b.volatility, sharpe_ratio=b.sharpe_ratio, var=b.var, beta=b.beta),
        lambda pk, b, _: RiskMetrics(metric_id=pk, portfolio_id=b.portfolio_id, as_of_date=_as_of(b), risk_level=b.risk_level, volatility=b.volatility, sharpe_ratio=b.sharpe_ratio, var=b.var, beta=b.beta),
        "Risk metrics not found",
    )

    @router.post("/risk-metrics/compute")
    async def compute_var(
        body: VarComputeRequest,
        analytics: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)] = None,
        history_repo: Annotated[object, Depends(get_portfolio_history_repo)] = None,
    ):
        portfolio_id = body.portfolio_id
        confidence = body.confidence
        method = body.method
        if not analytics or not history_repo:
            raise HTTPException(status_code=503, detail="Analytics service unavailable")
        points = await history_repo.get_range(str(portfolio_id), days=90)
        if len(points) < 2:
            raise HTTPException(status_code=400, detail="Insufficient portfolio history for VaR computation")
        values = [float(p.value) for p in points]
        returns = _values_to_returns(values)
        if not returns:
            raise HTTPException(status_code=400, detail="Could not compute returns from history")
        result = analytics.compute_var(
            returns=returns,
            confidence=confidence,
            method=method,
            portfolio_id=portfolio_id,
        )
        return result

    @router.post("/risk-metrics/compute-batch")
    async def compute_var_batch(
        body: VarBatchComputeRequest,
        analytics: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)] = None,
        history_repo: Annotated[object, Depends(get_portfolio_history_repo)] = None,
    ):
        if not analytics or not history_repo:
            raise HTTPException(status_code=503, detail="Analytics service unavailable")
        entries = []
        for portfolio_id in body.portfolio_ids:
            points = await history_repo.get_range(str(portfolio_id), days=body.days)
            if len(points) < 2:
                continue
            values = [float(p.value) for p in points]
            returns = _values_to_returns(values)
            if returns:
                entries.append((str(portfolio_id), returns))
        if not entries:
            raise HTTPException(status_code=400, detail="Insufficient portfolio history for any portfolio")
        result = analytics.compute_var_batch(
            entries=entries,
            confidence=body.confidence,
            method=body.method,
        )
        return result

    @router.post("/forecast/model")
    def forecast_with_model(
        body: dict,
        loader: Annotated[object, Depends(get_model_loader)] = None,
    ):
        if loader is None:
            raise HTTPException(status_code=503, detail="Model loader unavailable")
        model_uri = body.get("model_uri")
        values = body.get("values", [])
        if not model_uri or not values:
            raise HTTPException(status_code=400, detail="model_uri and values required")
        try:
            model = loader.load(model_uri)
            import pandas as pd
            df = pd.DataFrame([values])
            pred = model.predict(df)
            if hasattr(pred, "values"):
                forecast = pred.values.flatten().tolist()
            elif hasattr(pred, "tolist"):
                forecast = pred.tolist()
            else:
                forecast = list(pred)
            if forecast and isinstance(forecast[0], (list, tuple)):
                forecast = list(forecast[0])
            return {"forecast": forecast, "model_uri": model_uri}
        except Exception as e:
            raise HTTPException(status_code=422, detail=str(e)) from e

    @router.get("/analytics/portfolio-risk")
    def get_portfolio_risk_from_analytics(
        portfolio_id: Optional[str] = None,
        limit: int = 100,
        ch: Annotated[object, Depends(get_clickhouse_analytics)] = None,
    ):
        if ch is None:
            raise HTTPException(status_code=503, detail="Analytics store unavailable")
        try:
            rows = ch.get_portfolio_risk(portfolio_id=portfolio_id, limit=limit)
            return {"data": rows}
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Analytics query failed: {e}") from e

    @router.get("/analytics/delta-info")
    def get_delta_info(
        path: Optional[str] = None,
        ch: Annotated[object, Depends(get_clickhouse_analytics)] = None,
    ):
        if ch is None:
            raise HTTPException(status_code=503, detail="Analytics store unavailable")
        import os
        lookup = path or os.environ.get("DELTA_SAMPLE_PATH")
        if not lookup:
            raise HTTPException(status_code=400, detail="path query or DELTA_SAMPLE_PATH env required")
        try:
            stats = ch.get_latest_delta_stats(lookup)
            if stats is None:
                return {"path": lookup, "row_count": None, "sample": [], "updated_at": None}
            sample = []
            if stats.get("sample_json"):
                import json
                sample = json.loads(stats["sample_json"])
            return {"path": stats["path"], "row_count": stats["row_count"], "sample": sample, "updated_at": stats.get("updated_at")}
        except Exception as e:
            raise HTTPException(status_code=503, detail=str(e)) from e

    register_crud(
        router, "valuations", "valuation_id",
        ValuationCreate, ValuationResponse, get_valuation_repo,
        _valuation_to_response,
        lambda b: Valuation(valuation_id=uuid4(), instrument_id=b.instrument_id, as_of_date=_as_of(b), method=b.method, ev=b.ev, equity_value=b.equity_value, target_price=b.target_price, multiples=b.multiples, discount_rate=b.discount_rate, growth_rate=b.growth_rate),
        lambda pk, b, _: Valuation(valuation_id=pk, instrument_id=b.instrument_id, as_of_date=_as_of(b), method=b.method, ev=b.ev, equity_value=b.equity_value, target_price=b.target_price, multiples=b.multiples, discount_rate=b.discount_rate, growth_rate=b.growth_rate),
        "Valuation not found",
    )
