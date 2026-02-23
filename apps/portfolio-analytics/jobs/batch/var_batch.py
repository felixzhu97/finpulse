"""
Batch VaR job: compute VaR for multiple portfolios and write to Delta + ClickHouse.
Run from apps/portfolio-analytics: python -m jobs.batch.var_batch [--input path.json]
Input JSON: list of {"portfolio_id": "...", "returns": [0.01, -0.02, ...]}
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from src.infrastructure.analytics.clickhouse_client import ClickHouseAnalyticsClient
from src.infrastructure.external_services.analytics.pyspark_batch_var_adapter import PySparkBatchRiskVarAdapter
from src.infrastructure.spark.session import get_spark_session
from pyspark.sql.types import DoubleType, StringType, StructField, StructType


def load_entries_from_json(path: str) -> list[tuple[str, list[float]]]:
    with open(path) as f:
        data = json.load(f)
    return [(item["portfolio_id"], item["returns"]) for item in data]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default=None, help="Path to JSON file with portfolio_id and returns")
    parser.add_argument("--confidence", type=float, default=0.95)
    parser.add_argument("--method", default="historical")
    parser.add_argument("--delta-path", default=None, help="Delta table path for results (optional)")
    parser.add_argument("--skip-clickhouse", action="store_true")
    args = parser.parse_args()

    if args.input:
        entries = load_entries_from_json(args.input)
    else:
        entries = [
            ("demo", [0.01, -0.02, 0.015, -0.01, 0.02]),
            ("demo2", [0.005, 0.01, -0.005, 0.02, 0.01]),
        ]

    adapter = PySparkBatchRiskVarAdapter()
    results = adapter.compute_var_batch(
        entries=entries,
        confidence=args.confidence,
        method=args.method,
    )

    if not args.skip_clickhouse:
        ch = ClickHouseAnalyticsClient()
        ch.ensure_schema()
        today = date.today()
        for r in results:
            ch.insert_portfolio_risk(
                portfolio_id=r["portfolio_id"],
                as_of_date=today,
                var=r["var"],
                var_percent=r["var_percent"],
                volatility=r["volatility"],
                method=r["method"],
                confidence=r["confidence"],
                sharpe_ratio=None,
            )
        ch.close()
        print(f"Wrote {len(results)} rows to ClickHouse")

    if args.delta_path:
        spark = get_spark_session(app_name="var-batch-job")
        schema = StructType([
            StructField("portfolio_id", StringType(), False),
            StructField("var", DoubleType(), False),
            StructField("var_percent", DoubleType(), False),
            StructField("volatility", DoubleType(), False),
            StructField("method", StringType(), False),
            StructField("confidence", DoubleType(), False),
        ])
        rows = [(r["portfolio_id"], r["var"], r["var_percent"], r["volatility"], r["method"], r["confidence"]) for r in results]
        df = spark.createDataFrame(rows, schema)
        df.write.format("delta").mode("overwrite").save(args.delta_path)
        print(f"Wrote Delta table to {args.delta_path}")

    print(f"Computed VaR for {len(results)} portfolios")


if __name__ == "__main__":
    main()
