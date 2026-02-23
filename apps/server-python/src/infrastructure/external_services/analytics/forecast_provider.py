from typing import List

import numpy as np
from statsmodels.tsa.holtwinters import SimpleExpSmoothing


class ForecastProvider:
  def forecast(self, values: List[float], horizon: int = 1) -> dict:
    if len(values) < 2 or horizon < 1:
      return {"forecast": [], "horizon": horizon}
    arr = np.asarray(values, dtype=float)
    model = SimpleExpSmoothing(arr)
    fit = model.fit(optimized=True)
    preds = fit.forecast(steps=horizon)
    return {"forecast": [float(x) for x in preds], "horizon": horizon}
