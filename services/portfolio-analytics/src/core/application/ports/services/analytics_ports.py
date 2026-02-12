from __future__ import annotations

from typing import Any, List, Optional, Protocol, Tuple


class IModelLoader(Protocol):
    def load(self, model_uri: str) -> Any: ...


class IRiskVarPort(Protocol):
    def compute(
        self,
        returns: List[float],
        confidence: float = 0.95,
        method: str = "historical",
    ) -> dict: ...


class IFraudDetectorPort(Protocol):
    def score(
        self,
        amount: float,
        amount_currency: str,
        hour_of_day: int,
        day_of_week: int,
        recent_count_24h: int,
        reference_samples: Optional[List[List[float]]] = None,
    ) -> dict: ...


class ISurveillancePort(Protocol):
    def score_trade(
        self,
        quantity: float,
        notional: float,
        side: str,
        recent_quantities: List[float],
        recent_notionals: List[float],
    ) -> dict: ...


class ISentimentPort(Protocol):
    def score(self, text: str) -> dict: ...


class IIdentityPort(Protocol):
    def score(
        self,
        document_type: str,
        name_on_document: str,
        date_of_birth: Optional[str] = None,
        id_number: Optional[str] = None,
    ) -> dict: ...


class IForecastPort(Protocol):
    def forecast(self, values: List[float], horizon: int = 1) -> dict: ...


class ISummarisationPort(Protocol):
    def summarise(self, text: str, max_sentences: int = 3) -> dict: ...


class IOllamaGeneratePort(Protocol):
    def generate(self, prompt: str, model: Optional[str] = None) -> dict: ...


class IHfSummarisePort(Protocol):
    def summarise(
        self,
        text: str,
        max_length: int = 150,
        min_length: int = 30,
    ) -> dict: ...


class IBatchRiskVarPort(Protocol):
    def compute_var_batch(
        self,
        entries: List[Tuple[str, List[float]]],
        confidence: float = 0.95,
        method: str = "historical",
    ) -> List[dict]: ...
