from typing import List

import numpy as np
from scipy import stats

from app.domain.analytics.domain_services import var_interpretation


class RiskVarProvider:
  def compute(self, returns: List[float], confidence: float = 0.95, method: str = "historical") -> dict:
    if not returns:
      return {
        "var": 0.0,
        "var_percent": 0.0,
        "method": method,
        "confidence": confidence,
        "mean_return": 0.0,
        "volatility": 0.0,
        "interpretation": "Insufficient return history.",
      }
    arr = np.asarray(returns, dtype=float)
    if method == "historical":
      var = np.percentile(arr, (1 - confidence) * 100)
    else:
      mu, sigma = arr.mean(), arr.std()
      var = mu if sigma == 0 else mu + sigma * stats.norm.ppf(1 - confidence)
    var_pct = float(var) * 100
    return {
      "var": float(var),
      "var_percent": round(var_pct, 4),
      "method": method,
      "confidence": confidence,
      "mean_return": float(arr.mean()),
      "volatility": float(arr.std()),
      "interpretation": var_interpretation(float(var), confidence),
    }
