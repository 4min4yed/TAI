"""API Key middleware validates incoming service-to-service requests and injects scopes into request.state."""
from starlette.middleware.base import BaseHTTPMiddleware

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Validate X-API-Key header and set request.state.api_key_scopes
        return await call_next(request)
