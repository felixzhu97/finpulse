from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.watchlist.entities import Watchlist, WatchlistItem


class IWatchlistRepository(ABC):
    @abstractmethod
    async def get_by_id(self, watchlist_id: UUID) -> Optional[Watchlist]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[Watchlist]:
        pass

    @abstractmethod
    async def add(self, watchlist: Watchlist) -> Watchlist:
        pass

    @abstractmethod
    async def save(self, watchlist: Watchlist) -> Optional[Watchlist]:
        pass

    @abstractmethod
    async def remove(self, watchlist_id: UUID) -> bool:
        pass


class IWatchlistItemRepository(ABC):
    @abstractmethod
    async def get_by_id(self, watchlist_item_id: UUID) -> Optional[WatchlistItem]:
        pass

    @abstractmethod
    async def list(self, limit: int = 100, offset: int = 0) -> List[WatchlistItem]:
        pass

    @abstractmethod
    async def add(self, item: WatchlistItem) -> WatchlistItem:
        pass

    @abstractmethod
    async def save(self, item: WatchlistItem) -> Optional[WatchlistItem]:
        pass

    @abstractmethod
    async def remove(self, watchlist_item_id: UUID) -> bool:
        pass
