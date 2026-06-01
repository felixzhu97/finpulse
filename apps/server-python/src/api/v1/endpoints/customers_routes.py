from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query

from src.api.dependencies import get_session
from src.infrastructure.database.session import AsyncSession


router = APIRouter()


def _customer_to_dict(c: dict) -> dict:
    return {
        "customer_id": c["customer_id"],
        "name": c["name"],
        "email": c.get("email"),
        "kyc_status": c.get("kyc_status"),
        "created_at": c.get("created_at"),
    }


def register(r: APIRouter) -> None:
    @r.get("/api/v1/customers")
    async def customers_list(
        session: Annotated[AsyncSession, Depends(get_session)],
        limit: int = Query(100, ge=1, le=1000),
        offset: int = Query(0, ge=0),
    ) -> List[dict]:
        result = await session.execute(
            f"SELECT customer_id, name, email, kyc_status, created_at "
            f"FROM customers ORDER BY created_at LIMIT {limit} OFFSET {offset}"
        )
        rows = result.fetchall()
        return [_customer_to_dict(dict(r._mapping)) for r in rows]

    @r.get("/api/v1/customers/{customer_id}")
    async def customers_get(
        customer_id: str,
        session: Annotated[AsyncSession, Depends(get_session)],
    ) -> dict:
        result = await session.execute(
            "SELECT customer_id, name, email, kyc_status, created_at "
            "FROM customers WHERE customer_id = $1",
            (customer_id,),
        )
        row = result.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        return _customer_to_dict(dict(row._mapping))


register(router)
