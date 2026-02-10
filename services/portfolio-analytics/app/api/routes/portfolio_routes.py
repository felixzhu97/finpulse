from datetime import date
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.common import now_utc
from app.api.schemas import (
    PortfolioSchemaCreate,
    PortfolioSchemaResponse,
    PositionCreate,
    PositionResponse,
)
from app.dependencies import get_portfolio_schema_repo, get_position_repo
from app.domain.portfolio import PortfolioSchema, Position


def _portfolio_to_response(e: PortfolioSchema) -> PortfolioSchemaResponse:
    return PortfolioSchemaResponse(
        portfolio_id=e.portfolio_id,
        account_id=e.account_id,
        name=e.name,
        base_currency=e.base_currency,
        created_at=e.created_at,
    )


def _position_to_response(e: Position) -> PositionResponse:
    return PositionResponse(
        position_id=e.position_id,
        portfolio_id=e.portfolio_id,
        instrument_id=e.instrument_id,
        quantity=e.quantity,
        cost_basis=e.cost_basis,
        as_of_date=e.as_of_date,
    )


def register(router: APIRouter) -> None:
    now = now_utc

    @router.get("/portfolios", response_model=list[PortfolioSchemaResponse])
    async def list_portfolios(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_portfolio_schema_repo)] = None,
    ):
        return [_portfolio_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/portfolios/{portfolio_id}", response_model=PortfolioSchemaResponse)
    async def get_portfolio(
        portfolio_id: UUID,
        repo: Annotated[object, Depends(get_portfolio_schema_repo)] = None,
    ):
        entity = await repo.get_by_id(portfolio_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        return _portfolio_to_response(entity)

    @router.post("/portfolios", response_model=PortfolioSchemaResponse, status_code=201)
    async def create_portfolio(
        body: PortfolioSchemaCreate,
        repo: Annotated[object, Depends(get_portfolio_schema_repo)] = None,
    ):
        entity = PortfolioSchema(
            portfolio_id=uuid4(),
            account_id=body.account_id,
            name=body.name,
            base_currency=body.base_currency,
            created_at=now(),
        )
        created = await repo.add(entity)
        return _portfolio_to_response(created)

    @router.put("/portfolios/{portfolio_id}", response_model=PortfolioSchemaResponse)
    async def update_portfolio(
        portfolio_id: UUID,
        body: PortfolioSchemaCreate,
        repo: Annotated[object, Depends(get_portfolio_schema_repo)] = None,
    ):
        existing = await repo.get_by_id(portfolio_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        entity = PortfolioSchema(
            portfolio_id=portfolio_id,
            account_id=body.account_id,
            name=body.name,
            base_currency=body.base_currency,
            created_at=existing.created_at,
        )
        updated = await repo.save(entity)
        return _portfolio_to_response(updated)

    @router.delete("/portfolios/{portfolio_id}", status_code=204)
    async def delete_portfolio(
        portfolio_id: UUID,
        repo: Annotated[object, Depends(get_portfolio_schema_repo)] = None,
    ):
        ok = await repo.remove(portfolio_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Portfolio not found")

    @router.get("/positions", response_model=list[PositionResponse])
    async def list_positions(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_position_repo)] = None,
    ):
        return [_position_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/positions/{position_id}", response_model=PositionResponse)
    async def get_position(
        position_id: UUID,
        repo: Annotated[object, Depends(get_position_repo)] = None,
    ):
        entity = await repo.get_by_id(position_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Position not found")
        return _position_to_response(entity)

    @router.post("/positions", response_model=PositionResponse, status_code=201)
    async def create_position(
        body: PositionCreate,
        repo: Annotated[object, Depends(get_position_repo)] = None,
    ):
        entity = Position(
            position_id=uuid4(),
            portfolio_id=body.portfolio_id,
            instrument_id=body.instrument_id,
            quantity=body.quantity,
            cost_basis=body.cost_basis,
            as_of_date=body.as_of_date or date.today(),
        )
        created = await repo.add(entity)
        return _position_to_response(created)

    @router.put("/positions/{position_id}", response_model=PositionResponse)
    async def update_position(
        position_id: UUID,
        body: PositionCreate,
        repo: Annotated[object, Depends(get_position_repo)] = None,
    ):
        entity = Position(
            position_id=position_id,
            portfolio_id=body.portfolio_id,
            instrument_id=body.instrument_id,
            quantity=body.quantity,
            cost_basis=body.cost_basis,
            as_of_date=body.as_of_date or date.today(),
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Position not found")
        return _position_to_response(updated)

    @router.delete("/positions/{position_id}", status_code=204)
    async def delete_position(
        position_id: UUID,
        repo: Annotated[object, Depends(get_position_repo)] = None,
    ):
        ok = await repo.remove(position_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Position not found")
