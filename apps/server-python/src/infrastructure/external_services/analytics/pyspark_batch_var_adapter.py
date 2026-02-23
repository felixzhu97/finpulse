from __future__ import annotations

from typing import List, Tuple

from src.core.domain.services.analytics import var_interpretation
from src.infrastructure.external_services.analytics.risk_var_provider import RiskVarProvider


class PySparkBatchRiskVarAdapter:
    def __init__(self, risk_var_provider: RiskVarProvider | None = None):
        self._risk_var = risk_var_provider or RiskVarProvider()

    def compute_var_batch(
        self,
        entries: List[Tuple[str, List[float]]],
        confidence: float = 0.95,
        method: str = "historical",
    ) -> List[dict]:
        result = []
        for portfolio_id, returns in entries:
            out = self._risk_var.compute(returns=returns, confidence=confidence, method=method)
            out["portfolio_id"] = portfolio_id
            result.append(out)
        return result
