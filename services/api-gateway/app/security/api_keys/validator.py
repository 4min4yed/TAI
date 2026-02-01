"""API key validation helper (compare hashed value)"""
import hashlib

def validate_api_key(raw_key: str, stored_hash: str) -> bool:
    return hashlib.sha256(raw_key.encode()).hexdigest() == stored_hash
