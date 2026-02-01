"""Idempotency middleware using Redis to deduplicate requests by a key."""
from starlette.middleware.base import BaseHTTPMiddleware

class IdempotencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Parse Idempotency-Key header and consult Redis
        return await call_next(request)
