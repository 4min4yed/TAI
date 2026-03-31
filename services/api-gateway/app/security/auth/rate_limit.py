"""In-process sliding-window rate limiting for sensitive auth operations."""
from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timedelta
from threading import Lock


class SlidingWindowRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[datetime]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str, max_attempts: int, window_seconds: int) -> bool:
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=window_seconds)

        with self._lock:
            bucket = self._events[key]
            while bucket and bucket[0] < cutoff:
                bucket.popleft()

            if len(bucket) >= max_attempts:
                return False

            bucket.append(now)
            return True


auth_rate_limiter = SlidingWindowRateLimiter()
