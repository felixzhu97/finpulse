from __future__ import annotations

import io
from typing import Optional

from minio import Minio


class S3ObjectStorageClient:
    def __init__(
        self,
        endpoint: str = "localhost:9000",
        access_key: str = "minioadmin",
        secret_key: str = "minioadmin",
        secure: bool = False,
        bucket: str = "datalake",
    ):
        self._client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )
        self._bucket = bucket
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        if not self._client.bucket_exists(self._bucket):
            self._client.make_bucket(self._bucket)

    def put_object(self, object_name: str, data: bytes, length: int) -> None:
        self._client.put_object(
            self._bucket,
            object_name,
            io.BytesIO(data),
            length,
        )

    def get_object(self, object_name: str) -> bytes:
        response = self._client.get_object(self._bucket, object_name)
        try:
            return response.read()
        finally:
            response.close()

    def list_objects(self, prefix: str = "") -> list[str]:
        objects = self._client.list_objects(self._bucket, prefix=prefix, recursive=True)
        return [obj.object_name for obj in objects]

    def delete_object(self, object_name: str) -> None:
        self._client.remove_object(self._bucket, object_name)

    @property
    def bucket(self) -> str:
        return self._bucket

    def s3_uri(self, path: str) -> str:
        return f"s3a://{self._bucket}/{path.lstrip('/')}"
