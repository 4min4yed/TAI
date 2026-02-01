"""Idempotency key handler (Redis-backed)."""
import time


class IdempotencyStore:
    def __init__(self, redis):
        self.redis = redis

    def claim(self, key: str, ttl: int = 86400):
        # SETNX-like behavior
        return self.redis.set(key, time.time(), ex=ttl, nx=True)
