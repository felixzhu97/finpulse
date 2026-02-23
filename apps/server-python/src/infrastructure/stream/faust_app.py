"""
Faust stream app: consumes Kafka topics and writes to MinIO when STREAM_WRITE_TO_MINIO=1.
Run: faust -A src.infrastructure.stream.faust_app worker -l info
"""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone

import faust

BROKERS = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "127.0.0.1:9092").split(",")
QUOTES_TOPIC = os.environ.get("KAFKA_QUOTES_TOPIC", "market.quotes.enriched")
PORTFOLIO_TOPIC = os.environ.get("KAFKA_PORTFOLIO_TOPIC", "portfolio.events")
WRITE_TO_MINIO = os.environ.get("STREAM_WRITE_TO_MINIO", "").lower() in ("1", "true", "yes")
MINIO_ENDPOINT = os.environ.get("S3_ENDPOINT", "127.0.0.1:9000").replace("http://", "").replace("https://", "")
MINIO_ACCESS = os.environ.get("S3_ACCESS_KEY", "minioadmin")
MINIO_SECRET = os.environ.get("S3_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.environ.get("S3_BUCKET", "datalake")
QUOTES_BATCH_SIZE = int(os.environ.get("STREAM_QUOTES_BATCH_SIZE", "20"))

app = faust.App(
    "portfolio-stream",
    broker=BROKERS,
    store="memory",
    version=1,
)


class QuoteMessage(faust.Record):
    symbol: str
    price: float
    change: float
    change_rate: float
    timestamp: str | None = None


quote_topic = app.topic(QUOTES_TOPIC, value_type=QuoteMessage, partitions=1)
portfolio_topic = app.topic(PORTFOLIO_TOPIC, value_type=faust.Record, partitions=1)

_s3_client = None
_quote_batch: list = []
_last_flush = 0.0


def _get_s3_client():
    global _s3_client
    if _s3_client is None and WRITE_TO_MINIO:
        from src.infrastructure.object_storage.s3_client import S3ObjectStorageClient
        _s3_client = S3ObjectStorageClient(
            endpoint=MINIO_ENDPOINT,
            access_key=MINIO_ACCESS,
            secret_key=MINIO_SECRET,
            secure=False,
            bucket=MINIO_BUCKET,
        )
    return _s3_client


def _flush_quotes_to_minio() -> None:
    global _quote_batch, _last_flush
    if not _quote_batch:
        return
    client = _get_s3_client()
    if client is None:
        _quote_batch.clear()
        return
    try:
        now = datetime.now(timezone.utc)
        key = f"raw/quotes/dt={now.strftime('%Y-%m-%d')}/batch_{int(now.timestamp())}.json"
        data = json.dumps(_quote_batch).encode("utf-8")
        client.put_object(key, data, len(data))
    except Exception:
        pass
    _quote_batch.clear()
    _last_flush = time.time()


@app.agent(quote_topic)
async def process_quotes(stream: faust.Stream) -> None:
    global _quote_batch, _last_flush
    async for event in stream:
        if WRITE_TO_MINIO:
            _quote_batch.append({
                "symbol": event.symbol,
                "price": event.price,
                "change": event.change,
                "change_rate": event.change_rate,
                "timestamp": event.timestamp,
            })
            if len(_quote_batch) >= QUOTES_BATCH_SIZE or (time.time() - _last_flush) > 60:
                _flush_quotes_to_minio()
        else:
            print(f"Quote: {event.symbol} price={event.price} change_rate={event.change_rate}")


@app.agent(portfolio_topic)
async def process_portfolio_events(stream: faust.Stream) -> None:
    async for event in stream:
        print(f"Portfolio event: {event}")


if __name__ == "__main__":
    app.main()
