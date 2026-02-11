"""Application assembly: middleware, routes and docs registration."""
from fastapi import FastAPI
from app.routes.v1 import router as v1_router
from app.routes.v1.auth import router as auth_router


def create_app() -> FastAPI:
    app = FastAPI(title="API Gateway")
    
    # Register v1 grouped routers
    app.include_router(v1_router)
    
    # Also expose top-level auth routes for compatibility (/auth/...)
    app.include_router(auth_router)
    
    return app
