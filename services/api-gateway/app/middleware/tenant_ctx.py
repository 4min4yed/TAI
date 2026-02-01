"""Extract tenant from JWT or API key and set `request.state.tenant_id`."""
from starlette.middleware.base import BaseHTTPMiddleware

class TenantCtxMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Example: parse JWT, set request.state.tenant_id
        return await call_next(request)
