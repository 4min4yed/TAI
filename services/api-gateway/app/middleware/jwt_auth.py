"""JWT authentication supporting EdDSA/RS256/HS256 algorithms.

Routes may use `Depends(get_current_user)` which relies on this module.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.db import SessionLocal
from app.middleware.trace_log import middleware_trace
from app.security.auth.jwt_handler import verify_jwt as _verify_jwt
from app.security.auth.token_store import is_blacklisted


def verify_jwt(token: str):
    return _verify_jwt(token, expected_type="access")


PUBLIC_PREFIXES = (
    "/docs",
    "/openapi.json",
    "/redoc",
    "/healthz",
    "/v1/auth/login",
    "/v1/auth/register",
    "/v1/auth/refresh",
    "/v1/auth/forgot-password",
    "/v1/auth/verify-email",
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/verify-email",
)


class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.url.path.startswith(PUBLIC_PREFIXES):
            middleware_trace(request, "JWTAuthMiddleware", stage="public_bypass")
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return await call_next(request)

        middleware_trace(request, "JWTAuthMiddleware", stage="bearer_present")

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return JSONResponse(status_code=401, content={"detail": "Missing bearer token"})

        try:
            payload = verify_jwt(token)
        except Exception:
            middleware_trace(request, "JWTAuthMiddleware", stage="invalid_token")
            return JSONResponse(status_code=401, content={"detail": "Invalid bearer token"})

        jti = payload.get("jti")
        if jti and SessionLocal is not None:
            db = SessionLocal()
            try:
                if is_blacklisted(db, str(jti)):
                    middleware_trace(request, "JWTAuthMiddleware", stage="revoked_token")
                    return JSONResponse(status_code=401, content={"detail": "Token has been revoked"})
            finally:
                db.close()

        middleware_trace(request, "JWTAuthMiddleware", stage="validated")
        request.state.jwt_payload = payload
        request.state.user_id = str(payload.get("user_id", "")) or None
        request.state.role = str(payload.get("role", "")) or None
        if payload.get("tenant_id"):
            request.state.tenant_id = str(payload.get("tenant_id"))
        return await call_next(request)

async def jwt_auth_dependency(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None
    return verify_jwt(token)
