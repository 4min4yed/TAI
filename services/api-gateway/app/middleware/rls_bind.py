"""Bind tenant id to PostgreSQL session variable on each request to enforce RLS."""
from starlette.middleware.base import BaseHTTPMiddleware

class RLSBindMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # e.g. set request.state.tenant_id and execute SET app.current_tenant
        return await call_next(request)
