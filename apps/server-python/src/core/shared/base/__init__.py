from __future__ import annotations

from abc import ABC
from typing import Generic, TypeVar

T = TypeVar("T")


class Entity(ABC):
    pass


class ValueObject(ABC):
    pass


class AggregateRoot(Entity):
    pass


class Repository(ABC, Generic[T]):
    pass
