"""FastAPI app initialization + lifespan events."""
from .bootstrap import create_app

app = create_app()

@app.on_event("startup")
async def startup_event():
    # connect to DB, redis, initialize clients
    pass

@app.on_event("shutdown")
async def shutdown_event():
    # cleanup
    pass

