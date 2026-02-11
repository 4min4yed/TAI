"""FastAPI app initialization + lifespan events."""
from .bootstrap import create_app
from .core.config import Settings
from .core.db import init_db

settings = Settings()
app = create_app()

@app.on_event("startup")
async def startup_event():
    # Initialize database connection
    init_db(settings.DATABASE_URL)
    # TODO: Initialize redis and rabbitmq connections

@app.on_event("shutdown")
async def shutdown_event():
    # TODO: Cleanup connections
    pass

