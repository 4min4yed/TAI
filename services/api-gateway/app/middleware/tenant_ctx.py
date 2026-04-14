"""Extract tenant from authenticated request state and set `request.state.tenant_id`."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.tenant_context import reset_current_tenant_id, set_current_tenant_id
from app.core.db import SessionLocal
from app.middleware.trace_log import middleware_trace
from app.models.tenant import Tenant

class TenantCtxMiddleware(BaseHTTPMiddleware):
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
            middleware_trace(request, "TenantContextMiddleware", stage="public_bypass")
            return await call_next(request)

        tenant_id = (
            getattr(request.state, "tenant_id", None)
            or str(getattr(request.state, "jwt_payload", {}).get("tenant_id") or "")
        )

        tenant_id = tenant_id or None
        if tenant_id:
            middleware_trace(request, "TenantContextMiddleware", stage="tenant_detected", extra={"tenant_id": tenant_id})

        if tenant_id and SessionLocal is not None:
            db = SessionLocal()
            try:
                exists = db.query(Tenant.id).filter(Tenant.id == str(tenant_id)).first()
            finally:
                db.close()
            if not exists:
                middleware_trace(request, "TenantContextMiddleware", stage="invalid_tenant")
                return JSONResponse(status_code=401, content={"detail": "Invalid tenant context"})

        request.state.tenant_id = tenant_id
        token = set_current_tenant_id(tenant_id)
        try:
            return await call_next(request)
        finally:
            reset_current_tenant_id(token)


class TenantContextMiddleware(TenantCtxMiddleware):
    """Alias preserving requested middleware naming in stack docs."""
