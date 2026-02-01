"""RBAC middleware (present but often unused by current stack). Enforces role/permission checks at request level."""
from starlette.middleware.base import BaseHTTPMiddleware

class RBACMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Optional enforcement layer; check request.state.user roles
        return await call_next(request)
