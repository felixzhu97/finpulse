from typing import Annotated, Callable, TypeVar
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request

TEntity = TypeVar("TEntity")
TCreate = TypeVar("TCreate")
TResponse = TypeVar("TResponse")


def _uuid_param(request: Request, id_param: str) -> UUID:
    return UUID(str(request.path_params[id_param]))


def register_crud(
    router: APIRouter,
    path: str,
    id_param: str,
    create_schema: type,
    response_schema: type,
    get_repo,
    to_response: Callable[[TEntity], TResponse],
    from_create: Callable[[TCreate], TEntity],
    from_update: Callable[[UUID, TCreate, TEntity], TEntity],
    not_found_detail: str,
):
    base = path.rstrip("/")

    @router.get(f"/{base}", response_model=list[response_schema])
    async def _list(
        limit: int = 100,
        offset: int = 0,
        repo: Annotated[object, Depends(get_repo)] = None,
    ):
        return [to_response(e) for e in await repo.list(limit=limit, offset=offset)]

    @router.get(f"/{base}/{{{id_param}}}", response_model=response_schema)
    async def _get(
        request: Request,
        repo: Annotated[object, Depends(get_repo)] = None,
    ):
        pk = _uuid_param(request, id_param)
        entity = await repo.get_by_id(pk)
        if not entity:
            raise HTTPException(status_code=404, detail=not_found_detail)
        return to_response(entity)

    @router.post(f"/{base}", response_model=response_schema, status_code=201)
    async def _create(
        body: create_schema,
        repo: Annotated[object, Depends(get_repo)] = None,
    ):
        entity = from_create(body)
        created = await repo.add(entity)
        return to_response(created)

    @router.post(f"/{base}/batch", response_model=list[response_schema], status_code=201)
    async def _create_batch(
        body: list[create_schema],
        repo: Annotated[object, Depends(get_repo)] = None,
    ):
        entities = [from_create(item) for item in body]
        created = await repo.add_many(entities)
        return [to_response(e) for e in created]

    @router.put(f"/{base}/{{{id_param}}}", response_model=response_schema)
    async def _update(
        request: Request,
        body: create_schema,
        repo: Annotated[object, Depends(get_repo)] = None,
    ):
        pk = _uuid_param(request, id_param)
        existing = await repo.get_by_id(pk)
        if not existing:
            raise HTTPException(status_code=404, detail=not_found_detail)
        entity = from_update(pk, body, existing)
        updated = await repo.save(entity)
        return to_response(updated)

    @router.delete(f"/{base}/{{{id_param}}}", status_code=204)
    async def _delete(
        request: Request,
        repo: Annotated[object, Depends(get_repo)] = None,
    ):
        pk = _uuid_param(request, id_param)
        ok = await repo.remove(pk)
        if not ok:
            raise HTTPException(status_code=404, detail=not_found_detail)
