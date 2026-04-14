"""API key lifecycle manager (generate, rotate, revoke)."""
import bcrypt
import hashlib
import secrets

class APIKeyManager:
    def generate(self):
        raw = secrets.token_urlsafe(32)
        hashed = bcrypt.hashpw(raw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        return raw, hashed

    def rotate(self, key_id):
        # rotate key logic
        pass
