"""
Sample batch job: write a Delta table to the data lake.
Run from apps/portfolio-analytics: python -m jobs.batch.delta_sample
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from pyspark.sql import Row
from pyspark.sql.types import DoubleType, StringType, StructField, StructType

from src.infrastructure.spark.session import get_spark_session


def main() -> None:
    spark = get_spark_session(app_name="delta-sample-job")
    base_path = os.environ.get("DELTA_SAMPLE_PATH", "file:///tmp/delta_sample")
    schema = StructType([
        StructField("portfolio_id", StringType(), False),
        StructField("date", StringType(), False),
        StructField("value", DoubleType(), False),
    ])
    rows = [
        Row(portfolio_id="demo", date="2025-01-01", value=1000.0),
        Row(portfolio_id="demo", date="2025-01-02", value=1010.0),
        Row(portfolio_id="demo", date="2025-01-03", value=1005.0),
    ]
    df = spark.createDataFrame(rows, schema)
    df.write.format("delta").mode("overwrite").save(base_path)
    print(f"Wrote Delta table to {base_path}")


if __name__ == "__main__":
    main()
