"""Structured JSON logging middleware (ELK-compatible)."""
import json
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Basic example: log method/path/request_id
        response = await call_next(request)
        # Emit structured log (replace with real logger)
        print(json.dumps({"method": request.method, "path": request.url.path, "status": response.status_code}))
        return response
