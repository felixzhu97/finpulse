from typing import List

from app.infrastructure.analytics.tf_forecast_provider import forecast as tf_forecast_impl


class TfForecastAdapter:
    def forecast(
        self,
        values: List[float],
        horizon: int = 1,
        lookback: int = 5,
    ) -> dict:
        return tf_forecast_impl(values=values, horizon=horizon, lookback=lookback)
