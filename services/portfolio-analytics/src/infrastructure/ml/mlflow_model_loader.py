from __future__ import annotations

import os
from typing import Any

import mlflow


class MLflowModelLoader:
    def __init__(self, tracking_uri: str | None = None):
        self._tracking_uri = tracking_uri or os.environ.get("MLFLOW_TRACKING_URI", "http://127.0.0.1:5001")
        mlflow.set_tracking_uri(self._tracking_uri)

    def load(self, model_uri: str) -> Any:
        return mlflow.pyfunc.load_model(model_uri)

    def load_pytorch(self, model_uri: str) -> Any:
        return mlflow.pytorch.load_model(model_uri)
