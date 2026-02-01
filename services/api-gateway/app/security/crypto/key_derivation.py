"""HKDF key derivation (RFC 5869) - thin wrapper."""
from hashlib import sha256


def hkdf_extract(salt: bytes, ikm: bytes) -> bytes:
    # placeholder
    return sha256(salt + ikm).digest()
