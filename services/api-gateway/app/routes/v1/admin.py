"""Admin endpoints (analytics, audit logs, system info)."""
from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/health")
async def system_info():
    return {"uptime": 0}
