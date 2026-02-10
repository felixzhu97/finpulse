from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.common import now_utc
from app.api.schemas import (
    CustomerCreate,
    CustomerResponse,
    UserPreferenceCreate,
    UserPreferenceResponse,
)
from app.dependencies import get_customer_repo, get_user_preference_repo
from app.domain.identity import Customer, UserPreference


def _to_customer_response(e: Customer) -> CustomerResponse:
    return CustomerResponse(
        customer_id=e.customer_id,
        name=e.name,
        email=e.email,
        kyc_status=e.kyc_status,
        created_at=e.created_at,
    )


def _to_user_preference_response(e: UserPreference) -> UserPreferenceResponse:
    return UserPreferenceResponse(
        preference_id=e.preference_id,
        customer_id=e.customer_id,
        theme=e.theme,
        language=e.language,
        notifications_enabled=e.notifications_enabled,
        updated_at=e.updated_at,
    )


def register(router: APIRouter) -> None:
    now = now_utc

    @router.get("/customers", response_model=list[CustomerResponse])
    async def list_customers(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_customer_repo)] = None,
    ):
        return [_to_customer_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/customers/{customer_id}", response_model=CustomerResponse)
    async def get_customer(
        customer_id: UUID,
        repo: Annotated[object, Depends(get_customer_repo)] = None,
    ):
        entity = await repo.get_by_id(customer_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Customer not found")
        return _to_customer_response(entity)

    @router.post("/customers", response_model=CustomerResponse, status_code=201)
    async def create_customer(
        body: CustomerCreate,
        repo: Annotated[object, Depends(get_customer_repo)] = None,
    ):
        entity = Customer(
            customer_id=uuid4(),
            name=body.name,
            email=body.email,
            kyc_status=body.kyc_status,
            created_at=now(),
        )
        created = await repo.add(entity)
        return _to_customer_response(created)

    @router.put("/customers/{customer_id}", response_model=CustomerResponse)
    async def update_customer(
        customer_id: UUID,
        body: CustomerCreate,
        repo: Annotated[object, Depends(get_customer_repo)] = None,
    ):
        existing = await repo.get_by_id(customer_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        entity = Customer(
            customer_id=customer_id,
            name=body.name,
            email=body.email,
            kyc_status=body.kyc_status,
            created_at=existing.created_at,
        )
        updated = await repo.save(entity)
        return _to_customer_response(updated)

    @router.delete("/customers/{customer_id}", status_code=204)
    async def delete_customer(
        customer_id: UUID,
        repo: Annotated[object, Depends(get_customer_repo)] = None,
    ):
        ok = await repo.remove(customer_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Customer not found")

    @router.get("/user-preferences", response_model=list[UserPreferenceResponse])
    async def list_user_preferences(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_user_preference_repo)] = None,
    ):
        return [_to_user_preference_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get("/user-preferences/{preference_id}", response_model=UserPreferenceResponse)
    async def get_user_preference(
        preference_id: UUID,
        repo: Annotated[object, Depends(get_user_preference_repo)] = None,
    ):
        entity = await repo.get_by_id(preference_id)
        if not entity:
            raise HTTPException(status_code=404, detail="User preference not found")
        return _to_user_preference_response(entity)

    @router.post("/user-preferences", response_model=UserPreferenceResponse, status_code=201)
    async def create_user_preference(
        body: UserPreferenceCreate,
        repo: Annotated[object, Depends(get_user_preference_repo)] = None,
    ):
        entity = UserPreference(
            preference_id=uuid4(),
            customer_id=body.customer_id,
            theme=body.theme,
            language=body.language,
            notifications_enabled=body.notifications_enabled,
            updated_at=now(),
        )
        created = await repo.add(entity)
        return _to_user_preference_response(created)

    @router.put("/user-preferences/{preference_id}", response_model=UserPreferenceResponse)
    async def update_user_preference(
        preference_id: UUID,
        body: UserPreferenceCreate,
        repo: Annotated[object, Depends(get_user_preference_repo)] = None,
    ):
        entity = UserPreference(
            preference_id=preference_id,
            customer_id=body.customer_id,
            theme=body.theme,
            language=body.language,
            notifications_enabled=body.notifications_enabled,
            updated_at=now(),
        )
        updated = await repo.save(entity)
        if not updated:
            raise HTTPException(status_code=404, detail="User preference not found")
        return _to_user_preference_response(updated)

    @router.delete("/user-preferences/{preference_id}", status_code=204)
    async def delete_user_preference(
        preference_id: UUID,
        repo: Annotated[object, Depends(get_user_preference_repo)] = None,
    ):
        ok = await repo.remove(preference_id)
        if not ok:
            raise HTTPException(status_code=404, detail="User preference not found")
