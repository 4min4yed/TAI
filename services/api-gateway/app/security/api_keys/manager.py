"""API key lifecycle manager (generate, rotate, revoke)."""
import hashlib
import secrets

class APIKeyManager:
    def generate(self):
        raw = secrets.token_urlsafe(32)
        return raw, hashlib.sha256(raw.encode()).hexdigest()

    def rotate(self, key_id):
        # rotate key logic
        pass
