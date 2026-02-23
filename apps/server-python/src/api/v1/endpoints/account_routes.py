from uuid import UUID, uuid4

from fastapi import APIRouter

from src.api.v1.endpoints.common import now_utc
from src.api.v1.endpoints.crud_helpers import register_crud
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


def _from_create(body: AccountCreate) -> Account:
    return Account(
        account_id=uuid4(),
        customer_id=body.customer_id,
        account_type=body.account_type,
        currency=body.currency,
        status=body.status,
        opened_at=now_utc(),
    )


def _from_update(_pk: UUID, body: AccountCreate, existing: Account) -> Account:
    return Account(
        account_id=_pk,
        customer_id=body.customer_id,
        account_type=body.account_type,
        currency=body.currency,
        status=body.status,
        opened_at=existing.opened_at,
    )


def register(router: APIRouter) -> None:
    register_crud(
        router=router,
        path="accounts",
        id_param="account_id",
        create_schema=AccountCreate,
        response_schema=AccountResponse,
        get_repo=get_account_repo,
        to_response=_to_response,
        from_create=_from_create,
        from_update=_from_update,
        not_found_detail="Account not found",
    )
