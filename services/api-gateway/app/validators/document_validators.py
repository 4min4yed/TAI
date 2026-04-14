"""Document validation helpers (file type, size, path traversal)."""

from app.core.config import Settings


settings = Settings()

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
}
MAX_SIZE_BYTES = 100 * 1024 * 1024

MAGIC_PREFIXES: dict[str, tuple[bytes, ...]] = {
    "application/pdf": (b"%PDF-",),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b"PK\x03\x04",),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (b"PK\x03\x04",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
    "image/jpeg": (b"\xff\xd8\xff",),
}


def validate_file_type(mimetype: str) -> bool:
    return mimetype in ALLOWED_TYPES


def validate_file_size(size: int) -> bool:
    return size <= MAX_SIZE_BYTES


def validate_magic_number(mimetype: str, data: bytes) -> bool:
    allowed_prefixes = MAGIC_PREFIXES.get(mimetype)
    if not allowed_prefixes:
        return False
    return any(data.startswith(prefix) for prefix in allowed_prefixes)


def antivirus_scan_passed(data: bytes) -> bool:
    if not settings.DOCUMENT_AV_SCAN_ENABLED:
        return True

    try:
        import pyclamd
    except Exception:
        return False

    try:
        client = pyclamd.ClamdNetworkSocket()
        result = client.scan_stream(data)
        return result is None
    except Exception:
        return False
