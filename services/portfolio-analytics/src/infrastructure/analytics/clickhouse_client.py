from __future__ import annotations

import os
from datetime import date
from typing import Any, Optional

import clickhouse_connect


class ClickHouseAnalyticsClient:
    def __init__(
        self,
        host: Optional[str] = None,
        port: int = 8123,
        database: str = "analytics",
        username: str = "default",
        password: str = "",
    ):
        self._host = host or os.environ.get("CLICKHOUSE_HOST", "127.0.0.1")
        self._port = int(os.environ.get("CLICKHOUSE_PORT", port))
        self._database = database or os.environ.get("CLICKHOUSE_DATABASE", "analytics")
        self._username = username or os.environ.get("CLICKHOUSE_USER", "default")
        self._password = password or os.environ.get("CLICKHOUSE_PASSWORD", "")
        self._client: Optional[Any] = None

    def _get_client(self) -> Any:
        if self._client is None:
            self._client = clickhouse_connect.get_client(
                host=self._host,
                port=self._port,
                database=self._database,
                username=self._username,
                password=self._password or None,
            )
        return self._client

    def ensure_schema(self) -> None:
        temp = clickhouse_connect.get_client(
            host=self._host,
            port=self._port,
            database="default",
            username=self._username,
            password=self._password or None,
        )
        temp.command("CREATE DATABASE IF NOT EXISTS analytics")
        temp.close()
        client = self._get_client()
        client.command("""
            CREATE TABLE IF NOT EXISTS analytics.portfolio_risk_daily (
                portfolio_id String,
                as_of_date Date,
                var Float64,
                var_percent Float64,
                volatility Float64,
                sharpe_ratio Nullable(Float64),
                method String,
                confidence Float64
            ) ENGINE = MergeTree()
            ORDER BY (portfolio_id, as_of_date)
            PARTITION BY toYYYYMM(as_of_date)
        """)
        client.command("""
            CREATE TABLE IF NOT EXISTS analytics.quote_ohlc_1h (
                symbol String,
                bucket_1h DateTime64(3),
                open Float64,
                high Float64,
                low Float64,
                close Float64,
                volume Nullable(Float64)
            ) ENGINE = MergeTree()
            ORDER BY (symbol, bucket_1h)
            PARTITION BY toYYYYMM(bucket_1h)
        """)
        client.command("""
            CREATE TABLE IF NOT EXISTS analytics.delta_table_stats (
                path String,
                row_count UInt64,
                sample_json String,
                updated_at DateTime64(3)
            ) ENGINE = ReplacingMergeTree(updated_at)
            ORDER BY path
        """)

    def insert_portfolio_risk(
        self,
        portfolio_id: str,
        as_of_date: date,
        var: float,
        var_percent: float,
        volatility: float,
        method: str = "historical",
        confidence: float = 0.95,
        sharpe_ratio: Optional[float] = None,
    ) -> None:
        client = self._get_client()
        client.insert(
            "analytics.portfolio_risk_daily",
            [[portfolio_id, as_of_date, var, var_percent, volatility, sharpe_ratio, method, confidence]],
            column_names=["portfolio_id", "as_of_date", "var", "var_percent", "volatility", "sharpe_ratio", "method", "confidence"],
        )

    def insert_portfolio_risk_batch(self, rows: list[tuple]) -> None:
        if not rows:
            return
        client = self._get_client()
        client.insert(
            "analytics.portfolio_risk_daily",
            rows,
            column_names=["portfolio_id", "as_of_date", "var", "var_percent", "volatility", "sharpe_ratio", "method", "confidence"],
        )

    def query(self, sql: str, parameters: Optional[dict] = None) -> Any:
        return self._get_client().query(sql, parameters=parameters or {})

    def insert_delta_stats(self, path: str, row_count: int, sample_json: str) -> None:
        from datetime import datetime, timezone
        client = self._get_client()
        now = datetime.now(timezone.utc)
        client.insert(
            "analytics.delta_table_stats",
            [[path, row_count, sample_json, now]],
            column_names=["path", "row_count", "sample_json", "updated_at"],
        )

    def get_latest_delta_stats(self, path: Optional[str] = None) -> Optional[dict]:
        client = self._get_client()
        if path:
            result = client.query(
                "SELECT path, row_count, sample_json, updated_at FROM analytics.delta_table_stats FINAL WHERE path = {p:String} ORDER BY updated_at DESC LIMIT 1",
                parameters={"p": path},
            )
        else:
            result = client.query(
                "SELECT path, row_count, sample_json, updated_at FROM analytics.delta_table_stats FINAL ORDER BY updated_at DESC LIMIT 1",
            )
        if not result.result_rows:
            return None
        row = result.result_rows[0]
        return {"path": row[0], "row_count": row[1], "sample_json": row[2], "updated_at": str(row[3])}

    def get_portfolio_risk(self, portfolio_id: Optional[str] = None, limit: int = 100) -> list[dict]:
        client = self._get_client()
        if portfolio_id:
            result = client.query(
                "SELECT portfolio_id, as_of_date, var, var_percent, volatility, method, confidence FROM analytics.portfolio_risk_daily WHERE portfolio_id = {pid:String} ORDER BY as_of_date DESC LIMIT {lim:Int32}",
                parameters={"pid": portfolio_id, "lim": limit},
            )
        else:
            result = client.query(
                "SELECT portfolio_id, as_of_date, var, var_percent, volatility, method, confidence FROM analytics.portfolio_risk_daily ORDER BY as_of_date DESC LIMIT {lim:Int32}",
                parameters={"lim": limit},
            )
        columns = result.column_names
        return [dict(zip(columns, row)) for row in result.result_rows]

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None
