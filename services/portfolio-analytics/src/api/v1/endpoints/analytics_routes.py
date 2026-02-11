from datetime import date
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from src.api.v1.schemas import (
    RiskMetricsCreate,
    RiskMetricsResponse,
    ValuationCreate,
    ValuationResponse,
    VarComputeRequest,
)
from src.api.dependencies import (
    get_analytics_service,
    get_portfolio_history_repo,
    get_risk_metrics_repo,
    get_valuation_repo,
)
from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.domain.entities.analytics import RiskMetrics, Valuation


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


def register(router: APIRouter) -> None:
    @router.get("/risk-metrics", response_model=list[RiskMetricsResponse])
    async def list_risk_metrics(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_risk_metrics_repo)] = None,
    ):
        return [_risk_metrics_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/risk-metrics/{metric_id}", response_model=RiskMetricsResponse)
    async def get_risk_metrics(
        metric_id: UUID,
        repo: Annotated[object, Depends(get_risk_metrics_repo)] = None,
    ):
        entity = await repo.get_by_id(metric_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Risk metrics not found")
        return _risk_metrics_to_response(entity)

    @router.post("/risk-metrics", response_model=RiskMetricsResponse, status_code=201)
    async def create_risk_metrics(
        body: RiskMetricsCreate,
        repo: Annotated[object, Depends(get_risk_metrics_repo)] = None,
    ):
        entity = RiskMetrics(
            metric_id=uuid4(),
            portfolio_id=body.portfolio_id,
            as_of_date=body.as_of_date or date.today(),
            risk_level=body.risk_level,
            volatility=body.volatility,
            sharpe_ratio=body.sharpe_ratio,
            var=body.var,
            beta=body.beta,
        )
        created = await repo.add(entity)
        return _risk_metrics_to_response(created)

    @router.post("/risk-metrics/batch", response_model=list[RiskMetricsResponse], status_code=201)
    async def create_risk_metrics_batch(
        body: list[RiskMetricsCreate],
        repo: Annotated[object, Depends(get_risk_metrics_repo)] = None,
    ):
        entities = [
            RiskMetrics(
                metric_id=uuid4(),
                portfolio_id=item.portfolio_id,
                as_of_date=item.as_of_date or date.today(),
                risk_level=item.risk_level,
                volatility=item.volatility,
                sharpe_ratio=item.sharpe_ratio,
                var=item.var,
                beta=item.beta,
            )
            for item in body
        ]
        created = await repo.add_many(entities)
        return [_risk_metrics_to_response(e) for e in created]

    @router.put("/risk-metrics/{metric_id}", response_model=RiskMetricsResponse)
    async def update_risk_metrics(
        metric_id: UUID,
        body: RiskMetricsCreate,
        repo: Annotated[object, Depends(get_risk_metrics_repo)] = None,
    ):
        entity = RiskMetrics(
            metric_id=metric_id,
            portfolio_id=body.portfolio_id,
            as_of_date=body.as_of_date or date.today(),
            risk_level=body.risk_level,
            volatility=body.volatility,
            sharpe_ratio=body.sharpe_ratio,
            var=body.var,
            beta=body.beta,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Risk metrics not found")
        return _risk_metrics_to_response(updated)

    @router.delete("/risk-metrics/{metric_id}", status_code=204)
    async def delete_risk_metrics(
        metric_id: UUID,
        repo: Annotated[object, Depends(get_risk_metrics_repo)] = None,
    ):
        ok = await repo.remove(metric_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Risk metrics not found")

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
        returns = []
        for i in range(1, len(values)):
            if values[i - 1] and values[i - 1] != 0:
                r = (values[i] - values[i - 1]) / values[i - 1]
                returns.append(r)
        if not returns:
            raise HTTPException(status_code=400, detail="Could not compute returns from history")
        result = analytics.compute_var(
            returns=returns,
            confidence=confidence,
            method=method,
            portfolio_id=portfolio_id,
        )
        return result

    @router.get("/valuations", response_model=list[ValuationResponse])
    async def list_valuations(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_valuation_repo)] = None,
    ):
        return [_valuation_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/valuations/{valuation_id}", response_model=ValuationResponse)
    async def get_valuation(
        valuation_id: UUID,
        repo: Annotated[object, Depends(get_valuation_repo)] = None,
    ):
        entity = await repo.get_by_id(valuation_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Valuation not found")
        return _valuation_to_response(entity)

    @router.post("/valuations", response_model=ValuationResponse, status_code=201)
    async def create_valuation(
        body: ValuationCreate,
        repo: Annotated[object, Depends(get_valuation_repo)] = None,
    ):
        entity = Valuation(
            valuation_id=uuid4(),
            instrument_id=body.instrument_id,
            as_of_date=body.as_of_date or date.today(),
            method=body.method,
            ev=body.ev,
            equity_value=body.equity_value,
            target_price=body.target_price,
            multiples=body.multiples,
            discount_rate=body.discount_rate,
            growth_rate=body.growth_rate,
        )
        created = await repo.add(entity)
        return _valuation_to_response(created)

    @router.post("/valuations/batch", response_model=list[ValuationResponse], status_code=201)
    async def create_valuations_batch(
        body: list[ValuationCreate],
        repo: Annotated[object, Depends(get_valuation_repo)] = None,
    ):
        entities = [
            Valuation(
                valuation_id=uuid4(),
                instrument_id=item.instrument_id,
                as_of_date=item.as_of_date or date.today(),
                method=item.method,
                ev=item.ev,
                equity_value=item.equity_value,
                target_price=item.target_price,
                multiples=item.multiples,
                discount_rate=item.discount_rate,
                growth_rate=item.growth_rate,
            )
            for item in body
        ]
        created = await repo.add_many(entities)
        return [_valuation_to_response(e) for e in created]

    @router.put("/valuations/{valuation_id}", response_model=ValuationResponse)
    async def update_valuation(
        valuation_id: UUID,
        body: ValuationCreate,
        repo: Annotated[object, Depends(get_valuation_repo)] = None,
    ):
        entity = Valuation(
            valuation_id=valuation_id,
            instrument_id=body.instrument_id,
            as_of_date=body.as_of_date or date.today(),
            method=body.method,
            ev=body.ev,
            equity_value=body.equity_value,
            target_price=body.target_price,
            multiples=body.multiples,
            discount_rate=body.discount_rate,
            growth_rate=body.growth_rate,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Valuation not found")
        return _valuation_to_response(updated)

    @router.delete("/valuations/{valuation_id}", status_code=204)
    async def delete_valuation(
        valuation_id: UUID,
        repo: Annotated[object, Depends(get_valuation_repo)] = None,
    ):
        ok = await repo.remove(valuation_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Valuation not found")
