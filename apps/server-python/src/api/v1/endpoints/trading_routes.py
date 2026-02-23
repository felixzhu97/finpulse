from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from src.api.v1.endpoints.common import now_utc
from src.api.v1.endpoints.crud_helpers import register_crud
from src.api.v1.schemas import OrderCreate, OrderResponse, TradeCreate, TradeResponse
from src.api.dependencies import get_analytics_service, get_order_repo, get_trade_repo
from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.domain.entities.trading import Order, Trade


def _trade_to_response_enriched(
    e,
    surveillance_alert: Optional[str] = None,
    surveillance_score: Optional[float] = None,
) -> TradeResponse:
    return TradeResponse(
        trade_id=e.trade_id,
        order_id=e.order_id,
        quantity=e.quantity,
        price=e.price,
        fee=e.fee,
        executed_at=e.executed_at,
        surveillance_alert=surveillance_alert,
        surveillance_score=surveillance_score,
    )


def _order_to_response(e: Order) -> OrderResponse:
    return OrderResponse(
        order_id=e.order_id,
        account_id=e.account_id,
        instrument_id=e.instrument_id,
        side=e.side,
        quantity=e.quantity,
        order_type=e.order_type,
        status=e.status,
        created_at=e.created_at,
    )


def _trade_to_response(e: Trade) -> TradeResponse:
    return TradeResponse(
        trade_id=e.trade_id,
        order_id=e.order_id,
        quantity=e.quantity,
        price=e.price,
        fee=e.fee,
        executed_at=e.executed_at,
    )


def register(router: APIRouter) -> None:
    now = now_utc
    register_crud(
        router, "orders", "order_id",
        OrderCreate, OrderResponse, get_order_repo,
        _order_to_response,
        lambda b: Order(order_id=uuid4(), account_id=b.account_id, instrument_id=b.instrument_id, side=b.side, quantity=b.quantity, order_type=b.order_type, status=b.status, created_at=now()),
        lambda pk, b, ex: Order(order_id=pk, account_id=b.account_id, instrument_id=b.instrument_id, side=b.side, quantity=b.quantity, order_type=b.order_type, status=b.status, created_at=ex.created_at),
        "Order not found",
    )

    @router.get("/trades", response_model=list[TradeResponse])
    async def list_trades(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_trade_repo)] = None,
    ):
        return [_trade_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/trades/{trade_id}", response_model=TradeResponse)
    async def get_trade(
        trade_id: UUID,
        repo: Annotated[object, Depends(get_trade_repo)] = None,
    ):
        entity = await repo.get_by_id(trade_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Trade not found")
        return _trade_to_response(entity)

    @router.post("/trades", response_model=TradeResponse, status_code=201)
    async def create_trade(
        body: TradeCreate,
        repo: Annotated[object, Depends(get_trade_repo)] = None,
        order_repo: Annotated[object, Depends(get_order_repo)] = None,
        analytics: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)] = None,
    ):
        entity = Trade(
            trade_id=uuid4(),
            order_id=body.order_id,
            quantity=body.quantity,
            price=body.price,
            fee=body.fee or 0,
            executed_at=now(),
        )
        created = await repo.add(entity)
        alert = None
        score = None
        if analytics and order_repo:
            try:
                order = await order_repo.get_by_id(body.order_id)
                side = order.side if order else "buy"
                notional = float(created.quantity) * float(created.price)
                recent = await repo.list(limit=5, offset=0)
                recent_quantities = [float(t.quantity) for t in recent if t.trade_id != created.trade_id][:5]
                recent_notionals = [float(t.quantity) * float(t.price) for t in recent if t.trade_id != created.trade_id][:5]
                result = analytics.score_trade_surveillance(
                    quantity=float(created.quantity),
                    notional=notional,
                    side=side,
                    recent_quantities=recent_quantities,
                    recent_notionals=recent_notionals,
                    instrument_id=str(order.instrument_id) if order else None,
                )
                alert = result.get("alert_type")
                qz = result.get("quantity_zscore") or 0
                nz = result.get("notional_zscore") or 0
                score = max(abs(qz), abs(nz)) if (qz is not None or nz is not None) else None
            except Exception:
                pass
        return _trade_to_response_enriched(created, surveillance_alert=alert, surveillance_score=score)

    @router.post("/trades/batch", response_model=list[TradeResponse], status_code=201)
    async def create_trades_batch(
        body: list[TradeCreate],
        repo: Annotated[object, Depends(get_trade_repo)] = None,
    ):
        entities = [
            Trade(trade_id=uuid4(), order_id=item.order_id, quantity=item.quantity, price=item.price, fee=item.fee, executed_at=now())
            for item in body
        ]
        created = await repo.add_many(entities)
        return [_trade_to_response(e) for e in created]

    @router.put("/trades/{trade_id}", response_model=TradeResponse)
    async def update_trade(
        trade_id: UUID,
        body: TradeCreate,
        repo: Annotated[object, Depends(get_trade_repo)] = None,
    ):
        existing = await repo.get_by_id(trade_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Trade not found")
        entity = Trade(
            trade_id=trade_id,
            order_id=body.order_id,
            quantity=body.quantity,
            price=body.price,
            fee=body.fee,
            executed_at=existing.executed_at,
        )
        updated = await repo.save(entity)
        return _trade_to_response(updated)

    @router.delete("/trades/{trade_id}", status_code=204)
    async def delete_trade(
        trade_id: UUID,
        repo: Annotated[object, Depends(get_trade_repo)] = None,
    ):
        ok = await repo.remove(trade_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Trade not found")
