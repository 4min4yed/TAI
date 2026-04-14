"""API key validation helper (compare hashed value)"""
import bcrypt
import hashlib

def validate_api_key(raw_key: str, stored_hash: str) -> bool:
    if stored_hash.startswith("$2"):
        try:
            return bcrypt.checkpw(raw_key.encode("utf-8"), stored_hash.encode("utf-8"))
        except Exception:
            return False
    return hashlib.sha256(raw_key.encode()).hexdigest() == stored_hash
