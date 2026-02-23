# Portfolio Analytics – Runbook

## Startup order

1. **Core (required for API)**  
   `docker compose up -d postgres redis zookeeper kafka`  
   Then: migrations, start API (`uvicorn main:app --host 0.0.0.0 --port 8800`).

2. **Data lake and analytics (optional)**  
   `docker compose up -d minio clickhouse`  
   Set `S3_ENDPOINT`, `CLICKHOUSE_HOST` (and related env) if not using defaults.

3. **Orchestration and ML (optional)**  
   `docker compose up -d airflow-db airflow-webserver airflow-scheduler mlflow`.

4. **Full stack**  
   `docker compose up -d`  
   Starts all services. Allow 1–2 minutes for Airflow and MLflow to be ready.

## Endpoints and URLs

- API: `http://127.0.0.1:8800`
- MinIO console: `http://127.0.0.1:9001`
- Airflow: `http://127.0.0.1:8080` (admin / admin)
- MLflow: `http://127.0.0.1:5001`
- ClickHouse HTTP: `http://127.0.0.1:8123`

## Batch jobs

- **Delta sample**: `python -m jobs.batch.delta_sample` (writes to `DELTA_SAMPLE_PATH`).
- **Delta sync info**: `python -m jobs.batch.delta_sync_info` (reads Delta at `DELTA_SAMPLE_PATH`, writes row count and sample to ClickHouse; then `GET /api/v1/analytics/delta-info` serves it).
- **Batch VaR**: `python -m jobs.batch.var_batch [--input entries.json] [--delta-path s3a://datalake/analytics/var] [--skip-clickhouse]`.
- **PyTorch + MLflow**: `python -m jobs.ml.train_sample` (ensure MLflow is running and `MLFLOW_TRACKING_URI` is set).

## Stream processing

- **Faust**: From service directory, `faust -A src.infrastructure.stream.faust_app worker -l info`. Requires Kafka. Set `STREAM_WRITE_TO_MINIO=1` to write quote batches to MinIO via `S3ObjectStorageClient` (`raw/quotes/...`).

## Troubleshooting

- **ClickHouse connection refused**: Ensure ClickHouse container is up; port 8123 (host) maps to 8123 (container). Use `CLICKHOUSE_HOST=127.0.0.1` from host.
- **MinIO / S3A in Spark**: Set `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`; use path style. For Spark 3.x with MinIO, Hadoop S3A JARs may be required on the classpath.
- **Airflow DAGs not loading**: Check `dags/` is mounted and DAG files have no syntax errors. Airflow scheduler logs: `docker compose logs airflow-scheduler`.
- **MLflow 404**: Wait for the server to finish starting; ensure `MLFLOW_TRACKING_URI` points to `http://127.0.0.1:5001` (or the MLflow service host when running in Docker).
