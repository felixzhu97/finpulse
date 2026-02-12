"""
Sync Delta table stats to ClickHouse: read Delta at DELTA_SAMPLE_PATH, write row count and sample.
Run from services/portfolio-analytics: python -m jobs.batch.delta_sync_info
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from src.infrastructure.analytics.clickhouse_client import ClickHouseAnalyticsClient
from src.infrastructure.spark.session import get_spark_session


def main() -> None:
    path = os.environ.get("DELTA_SAMPLE_PATH", "file:///tmp/delta_sample")
    spark = get_spark_session(app_name="delta-sync-info")
    df = spark.read.format("delta").load(path)
    count = df.count()
    sample_rows = df.limit(10).collect()
    columns = df.columns
    sample = [dict(zip(columns, (x[c] for c in columns))) for x in sample_rows]
    for row in sample:
        for k, v in list(row.items()):
            if hasattr(v, "isoformat"):
                row[k] = v.isoformat() if v else None
            elif v is not None and not isinstance(v, (str, int, float, bool)):
                row[k] = str(v)
    sample_json = json.dumps(sample)
    ch = ClickHouseAnalyticsClient()
    ch.ensure_schema()
    ch.insert_delta_stats(path, count, sample_json)
    print(f"Synced Delta path={path} row_count={count}")


if __name__ == "__main__":
    main()
