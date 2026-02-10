from typing import List

import numpy as np
from tensorflow import keras


def _build_model(seq_len: int) -> keras.Model:
  return keras.Sequential([
    keras.layers.Input(shape=(seq_len, 1)),
    keras.layers.LSTM(8, activation="tanh"),
    keras.layers.Dense(1),
  ])


def forecast(values: List[float], horizon: int = 1, lookback: int = 5) -> dict:
  if len(values) < lookback + 1 or horizon < 1:
    return {"forecast": [], "horizon": horizon, "provider": "tensorflow"}
  arr = np.asarray(values, dtype=np.float32)
  X, y = [], []
  for i in range(len(arr) - lookback):
    X.append(arr[i : i + lookback])
    y.append(arr[i + lookback])
  X = np.array(X).reshape(-1, lookback, 1)
  y = np.array(y)
  model = _build_model(lookback)
  model.compile(optimizer="adam", loss="mse")
  model.fit(X, y, epochs=20, verbose=0)
  last = arr[-lookback:].reshape(1, lookback, 1)
  preds = []
  for _ in range(horizon):
    pred = model.predict(last, verbose=0)[0, 0]
    next_val = float(pred.item()) if hasattr(pred, "item") else float(pred)
    preds.append(next_val)
    last = np.roll(last, -1, axis=1)
    last[0, -1, 0] = next_val
  return {"forecast": preds, "horizon": horizon, "provider": "tensorflow"}
