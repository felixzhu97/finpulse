from typing import List, Optional

import numpy as np
from sklearn.ensemble import IsolationForest


def score_fraud_anomaly(
  amount: float,
  amount_currency: str,
  hour_of_day: int,
  day_of_week: int,
  recent_count_24h: int,
  reference_samples: Optional[List[List[float]]] = None,
) -> dict:
  X = np.array([[amount, hour_of_day, day_of_week, recent_count_24h]], dtype=float)
  if reference_samples and len(reference_samples) >= 10:
    ref = np.array(reference_samples, dtype=float)[:, :4]
  else:
    ref = np.random.RandomState(42).uniform(0, 10000, (50, 4))
    ref[:, 1] = np.clip(np.random.RandomState(43).rand(50) * 24, 0, 23)
    ref[:, 2] = np.clip(np.random.RandomState(44).rand(50) * 7, 0, 6)
    ref[:, 3] = np.clip(np.random.RandomState(45).rand(50) * 20, 0, 19)
  detector = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
  detector.fit(ref)
  pred = int(detector.predict(X)[0])
  score = float(detector.score_samples(X)[0])
  return {
    "is_anomaly": pred == -1,
    "anomaly_score": score,
    "amount": amount,
    "amount_currency": amount_currency,
  }
