from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from src.api.v1.endpoints.common import now_utc
from src.api.v1.schemas import (
    CashTransactionCreate,
    CashTransactionResponse,
    PaymentCreate,
    PaymentResponse,
    SettlementCreate,
    SettlementResponse,
)
from src.api.dependencies import (
    get_analytics_service,
    get_cash_transaction_repo,
    get_payment_repo,
    get_settlement_repo,
)
from src.core.application.use_cases.analytics_service import AnalyticsApplicationService
from src.core.domain.entities.payments import CashTransaction, Payment, Settlement


def _payment_to_response_enriched(
    e: Payment,
    fraud_recommendation: Optional[str] = None,
    fraud_score: Optional[float] = None,
) -> PaymentResponse:
    return PaymentResponse(
        payment_id=e.payment_id,
        account_id=e.account_id,
        counterparty=e.counterparty,
        amount=e.amount,
        currency=e.currency,
        status=e.status,
        created_at=e.created_at,
        fraud_recommendation=fraud_recommendation,
        fraud_score=fraud_score,
    )


def _cash_transaction_to_response(e: CashTransaction) -> CashTransactionResponse:
    return CashTransactionResponse(
        transaction_id=e.transaction_id,
        account_id=e.account_id,
        type=e.type,
        amount=e.amount,
        currency=e.currency,
        status=e.status,
        created_at=e.created_at,
    )


def _payment_to_response(e: Payment) -> PaymentResponse:
    return PaymentResponse(
        payment_id=e.payment_id,
        account_id=e.account_id,
        counterparty=e.counterparty,
        amount=e.amount,
        currency=e.currency,
        status=e.status,
        created_at=e.created_at,
    )


def _settlement_to_response(e: Settlement) -> SettlementResponse:
    return SettlementResponse(
        settlement_id=e.settlement_id,
        trade_id=e.trade_id,
        payment_id=e.payment_id,
        status=e.status,
        settled_at=e.settled_at,
    )


def register(router: APIRouter) -> None:
    now = now_utc

    @router.get("/cash-transactions", response_model=list[CashTransactionResponse])
    async def list_cash_transactions(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_cash_transaction_repo)] = None,
    ):
        return [_cash_transaction_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/cash-transactions/{transaction_id}", response_model=CashTransactionResponse)
    async def get_cash_transaction(
        transaction_id: UUID,
        repo: Annotated[object, Depends(get_cash_transaction_repo)] = None,
    ):
        entity = await repo.get_by_id(transaction_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Cash transaction not found")
        return _cash_transaction_to_response(entity)

    @router.post("/cash-transactions", response_model=CashTransactionResponse, status_code=201)
    async def create_cash_transaction(
        body: CashTransactionCreate,
        repo: Annotated[object, Depends(get_cash_transaction_repo)] = None,
    ):
        entity = CashTransaction(
            transaction_id=uuid4(),
            account_id=body.account_id,
            type=body.type,
            amount=body.amount,
            currency=body.currency,
            status=body.status,
            created_at=now(),
        )
        created = await repo.add(entity)
        return _cash_transaction_to_response(created)

    @router.post("/cash-transactions/batch", response_model=list[CashTransactionResponse], status_code=201)
    async def create_cash_transactions_batch(
        body: list[CashTransactionCreate],
        repo: Annotated[object, Depends(get_cash_transaction_repo)] = None,
    ):
        entities = [
            CashTransaction(
                transaction_id=uuid4(),
                account_id=item.account_id,
                type=item.type,
                amount=item.amount,
                currency=item.currency,
                status=item.status,
                created_at=now(),
            )
            for item in body
        ]
        created = await repo.add_many(entities)
        return [_cash_transaction_to_response(e) for e in created]

    @router.put("/cash-transactions/{transaction_id}", response_model=CashTransactionResponse)
    async def update_cash_transaction(
        transaction_id: UUID,
        body: CashTransactionCreate,
        repo: Annotated[object, Depends(get_cash_transaction_repo)] = None,
    ):
        existing = await repo.get_by_id(transaction_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Cash transaction not found")
        entity = CashTransaction(
            transaction_id=transaction_id,
            account_id=body.account_id,
            type=body.type,
            amount=body.amount,
            currency=body.currency,
            status=body.status,
            created_at=existing.created_at,
        )
        updated = await repo.save(entity)
        return _cash_transaction_to_response(updated)

    @router.delete("/cash-transactions/{transaction_id}", status_code=204)
    async def delete_cash_transaction(
        transaction_id: UUID,
        repo: Annotated[object, Depends(get_cash_transaction_repo)] = None,
    ):
        ok = await repo.remove(transaction_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Cash transaction not found")

    @router.get("/payments", response_model=list[PaymentResponse])
    async def list_payments(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_payment_repo)] = None,
    ):
        return [_payment_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/payments/{payment_id}", response_model=PaymentResponse)
    async def get_payment(
        payment_id: UUID,
        repo: Annotated[object, Depends(get_payment_repo)] = None,
    ):
        entity = await repo.get_by_id(payment_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Payment not found")
        return _payment_to_response(entity)

    @router.post("/payments", response_model=PaymentResponse, status_code=201)
    async def create_payment(
        body: PaymentCreate,
        repo: Annotated[object, Depends(get_payment_repo)] = None,
        analytics: Annotated[AnalyticsApplicationService, Depends(get_analytics_service)] = None,
    ):
        entity = Payment(
            payment_id=uuid4(),
            account_id=body.account_id,
            counterparty=body.counterparty,
            amount=body.amount,
            currency=body.currency,
            status=body.status,
            created_at=now(),
        )
        created = await repo.add(entity)
        fraud_rec = None
        fraud_sc = None
        if analytics:
            try:
                dt = created.created_at or datetime.utcnow()
                result = analytics.check_fraud(
                    amount=float(created.amount),
                    amount_currency=created.currency or "USD",
                    hour_of_day=dt.hour,
                    day_of_week=dt.weekday(),
                    recent_count_24h=0,
                )
                fraud_rec = result.get("recommendation")
                fraud_sc = result.get("anomaly_score")
            except Exception:
                pass
        return _payment_to_response_enriched(created, fraud_recommendation=fraud_rec, fraud_score=fraud_sc)

    @router.post("/payments/batch", response_model=list[PaymentResponse], status_code=201)
    async def create_payments_batch(
        body: list[PaymentCreate],
        repo: Annotated[object, Depends(get_payment_repo)] = None,
    ):
        entities = [
            Payment(
                payment_id=uuid4(),
                account_id=item.account_id,
                counterparty=item.counterparty,
                amount=item.amount,
                currency=item.currency,
                status=item.status,
                created_at=now(),
            )
            for item in body
        ]
        created = await repo.add_many(entities)
        return [_payment_to_response(e) for e in created]

    @router.put("/payments/{payment_id}", response_model=PaymentResponse)
    async def update_payment(
        payment_id: UUID,
        body: PaymentCreate,
        repo: Annotated[object, Depends(get_payment_repo)] = None,
    ):
        existing = await repo.get_by_id(payment_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Payment not found")
        entity = Payment(
            payment_id=payment_id,
            account_id=body.account_id,
            counterparty=body.counterparty,
            amount=body.amount,
            currency=body.currency,
            status=body.status,
            created_at=existing.created_at,
        )
        updated = await repo.save(entity)
        return _payment_to_response(updated)

    @router.delete("/payments/{payment_id}", status_code=204)
    async def delete_payment(
        payment_id: UUID,
        repo: Annotated[object, Depends(get_payment_repo)] = None,
    ):
        ok = await repo.remove(payment_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Payment not found")

    @router.get("/settlements", response_model=list[SettlementResponse])
    async def list_settlements(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_settlement_repo)] = None,
    ):
        return [_settlement_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/settlements/{settlement_id}", response_model=SettlementResponse)
    async def get_settlement(
        settlement_id: UUID,
        repo: Annotated[object, Depends(get_settlement_repo)] = None,
    ):
        entity = await repo.get_by_id(settlement_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Settlement not found")
        return _settlement_to_response(entity)

    @router.post("/settlements", response_model=SettlementResponse, status_code=201)
    async def create_settlement(
        body: SettlementCreate,
        repo: Annotated[object, Depends(get_settlement_repo)] = None,
    ):
        entity = Settlement(
            settlement_id=uuid4(),
            trade_id=body.trade_id,
            payment_id=body.payment_id,
            status=body.status,
            settled_at=body.settled_at,
        )
        created = await repo.add(entity)
        return _settlement_to_response(created)

    @router.post("/settlements/batch", response_model=list[SettlementResponse], status_code=201)
    async def create_settlements_batch(
        body: list[SettlementCreate],
        repo: Annotated[object, Depends(get_settlement_repo)] = None,
    ):
        entities = [
            Settlement(settlement_id=uuid4(), trade_id=item.trade_id, payment_id=item.payment_id, status=item.status, settled_at=item.settled_at)
            for item in body
        ]
        created = await repo.add_many(entities)
        return [_settlement_to_response(e) for e in created]

    @router.put("/settlements/{settlement_id}", response_model=SettlementResponse)
    async def update_settlement(
        settlement_id: UUID,
        body: SettlementCreate,
        repo: Annotated[object, Depends(get_settlement_repo)] = None,
    ):
        entity = Settlement(
            settlement_id=settlement_id,
            trade_id=body.trade_id,
            payment_id=body.payment_id,
            status=body.status,
            settled_at=body.settled_at,
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="Settlement not found")
        return _settlement_to_response(updated)

    @router.delete("/settlements/{settlement_id}", status_code=204)
    async def delete_settlement(
        settlement_id: UUID,
        repo: Annotated[object, Depends(get_settlement_repo)] = None,
    ):
        ok = await repo.remove(settlement_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Settlement not found")
