"""Centralized exception handling with consistent API error shape."""

from fastapi import HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.middleware.trace_log import middleware_trace


def _apply_security_headers(response, path: str) -> None:
    # FastAPI Swagger/ReDoc pages load JS/CSS from trusted CDNs by default.
    if path.startswith("/docs") or path.startswith("/redoc"):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.redoc.ly; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
        )
    else:
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            response = await call_next(request)
            _apply_security_headers(response, request.url.path)
            return response
        except HTTPException as exc:
            middleware_trace(request, "ErrorHandlerMiddleware", stage="http_exception", extra={"status": exc.status_code})
            response = JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": "http_error",
                    "message": exc.detail,
                    "request_id": getattr(request.state, "request_id", None),
                },
            )
            _apply_security_headers(response, request.url.path)
            return response
        except Exception:
            middleware_trace(request, "ErrorHandlerMiddleware", stage="unhandled_exception")
            response = JSONResponse(
                status_code=500,
                content={
                    "error": "internal_error",
                    "message": "An unexpected error occurred.",
                    "request_id": getattr(request.state, "request_id", None),
                },
            )
            _apply_security_headers(response, request.url.path)
            return response
