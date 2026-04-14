"""MinIO-backed object storage helper for document files."""

from __future__ import annotations

from io import BytesIO
from typing import Any

from app.core.config import Settings


class ObjectStorageService:
    def __init__(self) -> None:
        try:
            from minio import Minio
        except ModuleNotFoundError as exc:
            raise RuntimeError("MinIO client dependency is not installed") from exc

        self.settings = Settings()
        self.client: Any = Minio(
            self.settings.MINIO_ENDPOINT,
            access_key=self.settings.MINIO_ACCESS_KEY,
            secret_key=self.settings.MINIO_SECRET_KEY,
            secure=bool(self.settings.MINIO_SECURE),
        )
        self.bucket_name = self.settings.MINIO_BUCKET_NAME
        self._bucket_ready = False

    def _ensure_bucket(self) -> None:
        if self._bucket_ready:
            return
        found = self.client.bucket_exists(self.bucket_name)
        if not found:
            self.client.make_bucket(self.bucket_name)
        self._bucket_ready = True

    def put_bytes(self, object_name: str, data: bytes, content_type: str) -> None:
        self._ensure_bucket()
        stream = BytesIO(data)
        self.client.put_object(
            self.bucket_name,
            object_name,
            stream,
            length=len(data),
            content_type=content_type,
        )

    def get_bytes(self, object_name: str) -> tuple[bytes, str]:
        self._ensure_bucket()
        response = self.client.get_object(self.bucket_name, object_name)
        try:
            payload = response.read()
            content_type = response.headers.get("Content-Type", "application/octet-stream")
            return payload, content_type
        finally:
            response.close()
            response.release_conn()

    def remove(self, object_name: str) -> None:
        self._ensure_bucket()
        try:
            self.client.remove_object(self.bucket_name, object_name)
        except Exception:
            # Deleting a missing object should not fail API delete operations.
            return
