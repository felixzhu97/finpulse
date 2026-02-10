from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.common import now_utc
from app.api.schemas import OrderCreate, OrderResponse, TradeCreate, TradeResponse
from app.dependencies import get_order_repo, get_trade_repo
from app.domain.trading import Order, Trade


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

    @router.get("/orders", response_model=list[OrderResponse])
    async def list_orders(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_order_repo)] = None,
    ):
        return [_order_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/orders/{order_id}", response_model=OrderResponse)
    async def get_order(
        order_id: UUID,
        repo: Annotated[object, Depends(get_order_repo)] = None,
    ):
        entity = await repo.get_by_id(order_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Order not found")
        return _order_to_response(entity)

    @router.post("/orders", response_model=OrderResponse, status_code=201)
    async def create_order(
        body: OrderCreate,
        repo: Annotated[object, Depends(get_order_repo)] = None,
    ):
        entity = Order(
            order_id=uuid4(),
            account_id=body.account_id,
            instrument_id=body.instrument_id,
            side=body.side,
            quantity=body.quantity,
            order_type=body.order_type,
            status=body.status,
            created_at=now(),
        )
        created = await repo.add(entity)
        return _order_to_response(created)

    @router.put("/orders/{order_id}", response_model=OrderResponse)
    async def update_order(
        order_id: UUID,
        body: OrderCreate,
        repo: Annotated[object, Depends(get_order_repo)] = None,
    ):
        existing = await repo.get_by_id(order_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Order not found")
        entity = Order(
            order_id=order_id,
            account_id=body.account_id,
            instrument_id=body.instrument_id,
            side=body.side,
            quantity=body.quantity,
            order_type=body.order_type,
            status=body.status,
            created_at=existing.created_at,
        )
        updated = await repo.save(entity)
        return _order_to_response(updated)

    @router.delete("/orders/{order_id}", status_code=204)
    async def delete_order(
        order_id: UUID,
        repo: Annotated[object, Depends(get_order_repo)] = None,
    ):
        ok = await repo.remove(order_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Order not found")

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
    ):
        entity = Trade(
            trade_id=uuid4(),
            order_id=body.order_id,
            quantity=body.quantity,
            price=body.price,
            fee=body.fee,
            executed_at=now(),
        )
        created = await repo.add(entity)
        return _trade_to_response(created)

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
