"""
Sample PyTorch training script with MLflow logging.
Run from services/portfolio-analytics: python -m jobs.ml.train_sample
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import mlflow
import torch
import torch.nn as nn


class TinyModel(nn.Module):
    def __init__(self, input_size: int = 5, hidden: int = 8, output_size: int = 1):
        super().__init__()
        self.lin1 = nn.Linear(input_size, hidden)
        self.lin2 = nn.Linear(hidden, output_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = torch.relu(self.lin1(x))
        return self.lin2(x)


def main() -> None:
    mlflow.set_tracking_uri(os.environ.get("MLFLOW_TRACKING_URI", "http://127.0.0.1:5001"))
    mlflow.set_experiment("portfolio-forecast")
    with mlflow.start_run():
        model = TinyModel(5, 8, 1)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
        x = torch.randn(10, 5)
        y = torch.randn(10, 1)
        for _ in range(10):
            optimizer.zero_grad()
            loss = nn.functional.mse_loss(model(x), y)
            loss.backward()
            optimizer.step()
        mlflow.log_param("hidden", 8)
        mlflow.log_metric("loss", float(loss))
        mlflow.pytorch.log_model(model, "model")
        print("Logged model to MLflow")


if __name__ == "__main__":
    main()
