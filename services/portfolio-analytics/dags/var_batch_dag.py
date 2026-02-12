from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator

API_URL = "http://host.docker.internal:8800"
BATCH_ENDPOINT = f"{API_URL}/api/v1/risk-metrics/compute-batch"
DEFAULT_PAYLOAD = '{"portfolio_ids": ["demo"], "days": 90, "confidence": 0.95, "method": "historical"}'


with DAG(
    dag_id="var_batch_dag",
    start_date=datetime(2025, 1, 1),
    schedule_interval="@daily",
    catchup=False,
    tags=["analytics", "var"],
) as dag:
    trigger_batch_var = BashOperator(
        task_id="trigger_batch_var",
        bash_command=f'curl -s -X POST "{BATCH_ENDPOINT}" -H "Content-Type: application/json" -d \'{DEFAULT_PAYLOAD}\' || echo "API not reachable; ensure portfolio-analytics is running on host (e.g. port 8800)"',
    )
