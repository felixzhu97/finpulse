from __future__ import annotations

import os
from typing import Optional

_spark_session: Optional[object] = None


def get_spark_session(
    app_name: str = "server-python",
    master: Optional[str] = None,
    delta_warehouse_path: Optional[str] = None,
) -> object:
    from pyspark.sql import SparkSession

    global _spark_session
    if _spark_session is not None:
        return _spark_session

    master = master or os.environ.get("SPARK_MASTER", "local[*]")
    warehouse = delta_warehouse_path or os.environ.get(
        "SPARK_DELTA_WAREHOUSE",
        "s3a://datalake/warehouse",
    )
    s3_endpoint = os.environ.get("S3_ENDPOINT", "http://127.0.0.1:9000")
    s3_access = os.environ.get("S3_ACCESS_KEY", "minioadmin")
    s3_secret = os.environ.get("S3_SECRET_KEY", "minioadmin")

    builder = (
        SparkSession.builder.appName(app_name)
        .master(master)
        .config("spark.sql.warehouse.dir", warehouse)
        .config("spark.hadoop.fs.s3a.endpoint", s3_endpoint)
        .config("spark.hadoop.fs.s3a.access.key", s3_access)
        .config("spark.hadoop.fs.s3a.secret.key", s3_secret)
        .config("spark.hadoop.fs.s3a.path.style.access", "true")
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
    )

    try:
        from delta import configure_spark_with_delta_pip
        builder = configure_spark_with_delta_pip(builder)
    except Exception:
        builder = (
            builder.config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
            .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
        )

    _spark_session = builder.getOrCreate()

    try:
        _spark_session.sparkContext._jvm.org.apache.hadoop.fs.s3a.S3AFileSystem()
    except Exception:
        pass

    return _spark_session
