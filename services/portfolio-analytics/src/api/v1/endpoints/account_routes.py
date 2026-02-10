from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from src.api.v1.endpoints.common import now_utc
from src.api.v1.schemas import AccountCreate, AccountResponse
from src.api.dependencies import get_account_repo
from src.core.domain.entities.account import Account


def _to_response(e: Account) -> AccountResponse:
    return AccountResponse(
        account_id=e.account_id,
        customer_id=e.customer_id,
        account_type=e.account_type,
        currency=e.currency,
        status=e.status,
        opened_at=e.opened_at,
    )


def register(router: APIRouter) -> None:
    now = now_utc

    @router.get("/accounts", response_model=list[AccountResponse])
    async def list_accounts(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_account_repo)] = None,
    ):
        return [_to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/accounts/{account_id}", response_model=AccountResponse)
    async def get_account(
        account_id: UUID,
        repo: Annotated[object, Depends(get_account_repo)] = None,
    ):
        entity = await repo.get_by_id(account_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Account not found")
        return _to_response(entity)

    @router.post("/accounts", response_model=AccountResponse, status_code=201)
    async def create_account(
        body: AccountCreate,
        repo: Annotated[object, Depends(get_account_repo)] = None,
    ):
        entity = Account(
            account_id=uuid4(),
            customer_id=body.customer_id,
            account_type=body.account_type,
            currency=body.currency,
            status=body.status,
            opened_at=now(),
        )
        created = await repo.add(entity)
        return _to_response(created)

    @router.post("/accounts/batch", response_model=list[AccountResponse], status_code=201)
    async def create_accounts_batch(
        body: list[AccountCreate],
        repo: Annotated[object, Depends(get_account_repo)] = None,
    ):
        result = []
        for item in body:
            entity = Account(
                account_id=uuid4(),
                customer_id=item.customer_id,
                account_type=item.account_type,
                currency=item.currency,
                status=item.status,
                opened_at=now(),
            )
            created = await repo.add(entity)
            result.append(_to_response(created))
        return result

    @router.put("/accounts/{account_id}", response_model=AccountResponse)
    async def update_account(
        account_id: UUID,
        body: AccountCreate,
        repo: Annotated[object, Depends(get_account_repo)] = None,
    ):
        existing = await repo.get_by_id(account_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Account not found")
        entity = Account(
            account_id=account_id,
            customer_id=body.customer_id,
            account_type=body.account_type,
            currency=body.currency,
            status=body.status,
            opened_at=existing.opened_at,
        )
        updated = await repo.save(entity)
        return _to_response(updated)

    @router.delete("/accounts/{account_id}", status_code=204)
    async def delete_account(
        account_id: UUID,
        repo: Annotated[object, Depends(get_account_repo)] = None,
    ):
        ok = await repo.remove(account_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Account not found")
