"""SSRF protection: block requests to private IP ranges and metadata endpoints."""
from urllib.parse import urlparse

from app.middleware.trace_log import middleware_trace
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

PRIVATE_PREFIXES = ("127.", "10.", "192.168.", "169.254.")


def is_private(hostname):
    return any(hostname.startswith(p) for p in PRIVATE_PREFIXES)


def guard_url(url: str):
    parsed = urlparse(url)
    if is_private(parsed.hostname or ""):
        raise ValueError("SSRF blocked: private address")


class SSRFGuardMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        checked = False
        for field in ("url", "target_url", "webhook_url"):
            value = request.query_params.get(field)
            if not value:
                continue
            if not checked:
                middleware_trace(request, "SSRFGuardMiddleware", stage="url_check")
                checked = True
            try:
                guard_url(value)
            except ValueError as exc:
                middleware_trace(request, "SSRFGuardMiddleware", stage="blocked")
                return JSONResponse(status_code=400, content={"detail": str(exc)})
        return await call_next(request)
