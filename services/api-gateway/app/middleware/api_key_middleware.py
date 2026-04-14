"""API Key middleware validates incoming service-to-service requests and injects scopes into request.state."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.db import SessionLocal
from app.middleware.trace_log import middleware_trace
from app.models.api_key_model import APIKey
from app.security.api_keys.validator import validate_api_key

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        raw_key = request.headers.get("X-API-Key", "").strip()
        if not raw_key:
            return await call_next(request)

        middleware_trace(request, "APIKeyMiddleware", stage="key_present")

        if SessionLocal is None:
            return JSONResponse(status_code=503, content={"detail": "Database unavailable"})

        db = SessionLocal()
        try:
            keys = db.query(APIKey).filter(APIKey.disabled.is_(False)).all()
            match = None
            for key in keys:
                if validate_api_key(raw_key, key.key_hash):
                    match = key
                    break
        finally:
            db.close()

        if not match:
            middleware_trace(request, "APIKeyMiddleware", stage="invalid_key")
            return JSONResponse(status_code=401, content={"detail": "Invalid API key"})

        middleware_trace(request, "APIKeyMiddleware", stage="validated")
        request.state.api_key_scopes = [scope.strip() for scope in (match.scopes or "").split(",") if scope.strip()]
        return await call_next(request)
