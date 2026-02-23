from datetime import date
from uuid import UUID, uuid4

from fastapi import APIRouter

from src.api.v1.endpoints.common import now_utc
from src.api.v1.endpoints.crud_helpers import register_crud
from src.api.v1.schemas import (
    PortfolioSchemaCreate,
    PortfolioSchemaResponse,
    PositionCreate,
    PositionResponse,
)
from src.api.dependencies import get_portfolio_schema_repo, get_position_repo
from src.core.domain.entities.portfolio import PortfolioSchema, Position


def _portfolio_response(e: PortfolioSchema) -> PortfolioSchemaResponse:
    return PortfolioSchemaResponse(portfolio_id=e.portfolio_id, account_id=e.account_id, name=e.name, base_currency=e.base_currency, created_at=e.created_at)


def _position_response(e: Position) -> PositionResponse:
    return PositionResponse(position_id=e.position_id, portfolio_id=e.portfolio_id, instrument_id=e.instrument_id, quantity=e.quantity, cost_basis=e.cost_basis, as_of_date=e.as_of_date)


def register(router: APIRouter) -> None:
    register_crud(
        router, "portfolios", "portfolio_id",
        PortfolioSchemaCreate, PortfolioSchemaResponse, get_portfolio_schema_repo,
        _portfolio_response,
        lambda b: PortfolioSchema(portfolio_id=uuid4(), account_id=b.account_id, name=b.name, base_currency=b.base_currency, created_at=now_utc()),
        lambda pk, b, ex: PortfolioSchema(portfolio_id=pk, account_id=b.account_id, name=b.name, base_currency=b.base_currency, created_at=ex.created_at),
        "Portfolio not found",
    )
    register_crud(
        router, "positions", "position_id",
        PositionCreate, PositionResponse, get_position_repo,
        _position_response,
        lambda b: Position(position_id=uuid4(), portfolio_id=b.portfolio_id, instrument_id=b.instrument_id, quantity=b.quantity, cost_basis=b.cost_basis, as_of_date=b.as_of_date or date.today()),
        lambda pk, b, _: Position(position_id=pk, portfolio_id=b.portfolio_id, instrument_id=b.instrument_id, quantity=b.quantity, cost_basis=b.cost_basis, as_of_date=b.as_of_date or date.today()),
        "Position not found",
    )
