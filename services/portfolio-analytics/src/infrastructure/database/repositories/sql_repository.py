from typing import Callable, List, Optional, Type, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

TEntity = TypeVar("TEntity")
TRow = TypeVar("TRow")
TId = TypeVar("TId")


class SqlRepository:
    def __init__(
        self,
        session: AsyncSession,
        row_class: Type[TRow],
        id_attr: str,
        to_entity: Callable[[TRow], TEntity],
        from_entity: Callable[[TEntity], dict],
    ):
        self._session = session
        self._row_class = row_class
        self._id_attr = id_attr
        self._to_entity = to_entity
        self._from_entity = from_entity

    async def get_by_id(self, id: TId) -> Optional[TEntity]:
        result = await self._session.execute(
            select(self._row_class).where(getattr(self._row_class, self._id_attr) == id)
        )
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def list(self, limit: int = 100, offset: int = 0) -> List[TEntity]:
        result = await self._session.execute(
            select(self._row_class).limit(limit).offset(offset)
        )
        rows = result.scalars().all()
        return [self._to_entity(r) for r in rows]

    async def add(self, entity: TEntity) -> TEntity:
        data = self._from_entity(entity)
        data.pop(self._id_attr, None)
        row = self._row_class(**data)
        self._session.add(row)
        await self._session.flush()
        await self._session.refresh(row)
        return self._to_entity(row)

    async def save(self, entity: TEntity) -> Optional[TEntity]:
        id_val = getattr(entity, self._id_attr)
        result = await self._session.execute(
            select(self._row_class).where(
                getattr(self._row_class, self._id_attr) == id_val
            )
        )
        row = result.scalar_one_or_none()
        if not row:
            return None
        data = self._from_entity(entity)
        data.pop(self._id_attr, None)
        for key, value in data.items():
            setattr(row, key, value)
        await self._session.flush()
        await self._session.refresh(row)
        return self._to_entity(row)

    async def remove(self, id: TId) -> bool:
        result = await self._session.execute(
            select(self._row_class).where(getattr(self._row_class, self._id_attr) == id)
        )
        row = result.scalar_one_or_none()
        if not row:
            return False
        await self._session.delete(row)
        await self._session.flush()
        return True
