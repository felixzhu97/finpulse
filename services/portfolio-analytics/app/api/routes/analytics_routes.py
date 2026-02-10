from datetime import date
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.schemas import RiskMetricsCreate, RiskMetricsResponse, ValuationCreate, ValuationResponse
from app.dependencies import get_risk_metrics_repo, get_valuation_repo
from app.domain.analytics import RiskMetrics, Valuation


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
