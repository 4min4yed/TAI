"""Application assembly: middleware, routes and docs registration."""
from fastapi import FastAPI
from app.middleware.api_key_middleware import APIKeyMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.idempotency_mw import IdempotencyMiddleware
from app.middleware.jwt_auth import JWTAuthMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.rls_bind import RLSBindMiddleware
from app.middleware.ssrf_guard import SSRFGuardMiddleware
from app.middleware.tenant_ctx import TenantContextMiddleware
from app.routes.health import router as health_router
from app.routes.v1 import router as v1_router
from app.routes.v1.auth import router as auth_router


def create_app() -> FastAPI:
    app = FastAPI(title="API Gateway")

    # Starlette applies middleware in reverse add order.
    # Requested execution order:
    # 1 RequestID -> 2 Logging -> 3 JWTAuth -> 4 TenantContext -> 5 RLSBind
    # -> 6 ErrorHandler -> 7 RateLimit -> 8 Idempotency -> 9 APIKey -> 10 SSRFGuard
    app.add_middleware(SSRFGuardMiddleware)
    app.add_middleware(APIKeyMiddleware)
    app.add_middleware(IdempotencyMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(RLSBindMiddleware)
    app.add_middleware(TenantContextMiddleware)
    app.add_middleware(JWTAuthMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)
    
    # Register v1 grouped routers
    app.include_router(v1_router)

    # Public health endpoint
    app.include_router(health_router)
    
    # Also expose top-level auth routes for compatibility (/auth/...)
    app.include_router(auth_router)
    
    return app
