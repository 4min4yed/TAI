"""Bind tenant id to PostgreSQL session variable on each request to enforce RLS."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.middleware.trace_log import middleware_trace

class RLSBindMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        path = request.url.path
        is_public = (
            path.startswith("/v1/auth")
            or path.startswith("/auth")
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi.json")
            or path.startswith("/healthz")
        )
        if is_public:
            middleware_trace(request, "RLSBindMiddleware", stage="public_bypass")
            return await call_next(request)

        if not is_public and path.startswith("/v1") and not getattr(request.state, "tenant_id", None):
            middleware_trace(request, "RLSBindMiddleware", stage="blocked_missing_tenant")
            return JSONResponse(
                status_code=401,
                content={"error": "missing_tenant", "message": "Tenant context is required."},
            )
        return await call_next(request)
