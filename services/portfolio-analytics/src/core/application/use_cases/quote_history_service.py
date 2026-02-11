from typing import Dict, Iterable

from src.core.application.ports.repositories.realtime_quote_repository import IRealtimeQuoteRepository


class QuoteHistoryService:
    def __init__(self, repository: IRealtimeQuoteRepository) -> None:
        self._repo = repository

    def get_history(self, symbols: Iterable[str], minutes: int = 5) -> Dict[str, list]:
        requested = [str(s).strip().upper() for s in symbols if str(s).strip()]
        if not requested:
            return {}
        return self._repo.get_quote_history(requested, minutes=minutes)
