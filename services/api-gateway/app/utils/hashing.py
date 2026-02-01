"""Hashing utilities (SHA-256, file checksums)."""
import hashlib


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
