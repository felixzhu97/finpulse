from typing import List

import numpy as np


def score_trade_anomaly(
  quantity: float,
  notional: float,
  side: str,
  recent_quantities: List[float],
  recent_notionals: List[float],
) -> dict:
  if not recent_quantities and not recent_notionals:
    return {
      "is_anomaly": False,
      "quantity_zscore": 0.0,
      "notional_zscore": 0.0,
      "quantity": quantity,
      "notional": notional,
      "side": side,
    }
  q_arr = np.array(recent_quantities or [quantity], dtype=float)
  n_arr = np.array(recent_notionals or [notional], dtype=float)
  q_mean, q_std = float(q_arr.mean()), float(q_arr.std()) if len(q_arr) > 1 else 0.0
  n_mean, n_std = float(n_arr.mean()), float(n_arr.std()) if len(n_arr) > 1 else 0.0
  q_z = (quantity - q_mean) / q_std if q_std > 0 else 0.0
  n_z = (notional - n_mean) / n_std if n_std > 0 else 0.0
  try:
    q_z, n_z = float(q_z), float(n_z)
  except (TypeError, ValueError):
    q_z, n_z = 0.0, 0.0
  threshold = 2.5
  return {
    "is_anomaly": abs(q_z) > threshold or abs(n_z) > threshold,
    "quantity_zscore": q_z,
    "notional_zscore": n_z,
    "quantity": quantity,
    "notional": notional,
    "side": side,
  }
