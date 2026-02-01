"""Document validation helpers (file type, size, path traversal)."""

ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
MAX_SIZE_BYTES = 50 * 1024 * 1024


def validate_file_type(mimetype: str) -> bool:
    return mimetype in ALLOWED_TYPES


def validate_file_size(size: int) -> bool:
    return size <= MAX_SIZE_BYTES
