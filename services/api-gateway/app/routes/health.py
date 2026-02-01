"""Health check endpoints (no auth required)."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/healthz", tags=["health"])
async def healthz():
    return {"status": "ok"}
