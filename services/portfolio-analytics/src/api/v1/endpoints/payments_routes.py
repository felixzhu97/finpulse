from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from src.api.v1.endpoints.common import now_utc
from src.api.v1.endpoints.crud_helpers import register_crud
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
    register_crud(
        router, "cash-transactions", "transaction_id",
        CashTransactionCreate, CashTransactionResponse, get_cash_transaction_repo,
        _cash_transaction_to_response,
        lambda b: CashTransaction(transaction_id=uuid4(), account_id=b.account_id, type=b.type, amount=b.amount, currency=b.currency, status=b.status, created_at=now()),
        lambda pk, b, ex: CashTransaction(transaction_id=pk, account_id=b.account_id, type=b.type, amount=b.amount, currency=b.currency, status=b.status, created_at=ex.created_at),
        "Cash transaction not found",
    )

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
                dt = created.created_at or now()
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

    register_crud(
        router, "settlements", "settlement_id",
        SettlementCreate, SettlementResponse, get_settlement_repo,
        _settlement_to_response,
        lambda b: Settlement(settlement_id=uuid4(), trade_id=b.trade_id, payment_id=b.payment_id, status=b.status, settled_at=b.settled_at),
        lambda pk, b, _: Settlement(settlement_id=pk, trade_id=b.trade_id, payment_id=b.payment_id, status=b.status, settled_at=b.settled_at),
        "Settlement not found",
    )
