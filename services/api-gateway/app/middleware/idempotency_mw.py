"""Idempotency middleware using Redis to deduplicate requests by a key."""
import time

from app.middleware.trace_log import middleware_trace
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


_IDEMPOTENCY_CACHE: dict[str, tuple[int, dict, float]] = {}
_WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
_TTL_SECONDS = 24 * 60 * 60

class IdempotencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method.upper() not in _WRITE_METHODS:
            return await call_next(request)

        key = request.headers.get("Idempotency-Key", "").strip()
        if not key:
            return await call_next(request)

        middleware_trace(request, "IdempotencyMiddleware", stage="key_present")

        cache_key = f"{request.method}:{request.url.path}:{key}"
        now = time.time()
        cached = _IDEMPOTENCY_CACHE.get(cache_key)
        if cached and cached[2] > now:
            middleware_trace(request, "IdempotencyMiddleware", stage="cache_hit")
            status_code, body, _ = cached
            return JSONResponse(status_code=status_code, content=body)

        response = await call_next(request)
        if 200 <= response.status_code < 300:
            middleware_trace(request, "IdempotencyMiddleware", stage="cache_store")
            _IDEMPOTENCY_CACHE[cache_key] = (
                response.status_code,
                {"status": "cached", "idempotency_key": key},
                now + _TTL_SECONDS,
            )
        return response
