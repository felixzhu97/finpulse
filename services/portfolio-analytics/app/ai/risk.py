from typing import List

import numpy as np


def _norm_ppf(p: float) -> float:
  a = (-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0)
  b = (-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1)
  if p <= 0 or p >= 1:
    return 0.0
  q = p - 0.5
  if abs(q) <= 0.425:
    r = 0.180625 - q * q
    num = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5])
    den = (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0)
    return q * num / den
  r = np.sqrt(-np.log(min(p, 1 - p)))
  if q < 0:
    r = -r
  c = (2.30753, 0.27061, 0.99229, 0.04481)
  num = (c[0] + c[1] * r) * r + c[2]
  den = (c[3] * r + 1.0) * r + 1.0
  return r * num / den if q >= 0 else -r * num / den


def compute_var(
  returns: List[float],
  confidence: float = 0.95,
  method: str = "historical",
) -> dict:
  if not returns:
    return {"var": 0.0, "method": method, "confidence": confidence}
  arr = np.asarray(returns, dtype=float)
  if method == "historical":
    var = np.percentile(arr, (1 - confidence) * 100)
  else:
    mu, sigma = arr.mean(), arr.std()
    if sigma == 0:
      var = mu
    else:
      var = mu + sigma * _norm_ppf(1 - confidence)
  return {
    "var": float(var),
    "method": method,
    "confidence": confidence,
    "mean_return": float(arr.mean()),
    "volatility": float(arr.std()),
  }
