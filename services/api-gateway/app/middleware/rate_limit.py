"""Basic rate limiting middleware using Redis token buckets (per-tenant/per-user)."""
import time

from app.core.config import Settings
from app.middleware.trace_log import middleware_trace
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


settings = Settings()
_BUCKETS: dict[str, tuple[int, float]] = {}


def _consume(key: str, limit: int, window_seconds: int) -> tuple[bool, int, int]:
    now = time.time()
    count, reset_at = _BUCKETS.get(key, (0, now + window_seconds))
    if now > reset_at:
        count, reset_at = 0, now + window_seconds
    count += 1
    _BUCKETS[key] = (count, reset_at)
    remaining = max(0, limit - count)
    return count <= limit, remaining, max(0, int(reset_at - now))

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        path = request.url.path
        is_public = (
            path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi.json")
            or path.startswith("/healthz")
        )
        user_id = getattr(request.state, "user_id", None)
        client_ip = (request.client.host if request.client else "unknown")
        key = f"user:{user_id}" if user_id else f"ip:{client_ip}"
        limit = settings.AUTH_RATE_LIMIT_AUTH_PER_MIN if user_id else settings.AUTH_RATE_LIMIT_ANON_PER_MIN
        if is_public:
            return await call_next(request)

        middleware_trace(request, "RateLimitMiddleware", stage="enforce", extra={"key": key, "limit": int(limit)})
        allowed, remaining, reset = _consume(key, max(1, int(limit)), 60)
        if not allowed:
            middleware_trace(request, "RateLimitMiddleware", stage="blocked", extra={"key": key})
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset)
        response.headers["X-RateLimit-Key"] = key
        response.headers["X-RateLimit-Algorithm"] = "token_bucket"
        return response
