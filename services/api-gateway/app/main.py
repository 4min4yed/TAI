"""FastAPI app initialization + lifespan events."""
from .bootstrap import create_app
from .core.config import Settings
from .core.db import init_db
from fastapi.middleware.cors import CORSMiddleware

settings = Settings()
app = create_app()


def _build_allowed_origins() -> list[str]:
    origins = [origin.strip() for origin in settings.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]
    if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
        origins.append(settings.FRONTEND_URL)
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize database connection
    init_db(settings.DATABASE_URL)
    # TODO: Initialize redis and rabbitmq connections

@app.on_event("shutdown")
async def shutdown_event():
    # TODO: Cleanup connections
    pass

