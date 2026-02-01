"""API key lifecycle endpoints (create, list, rotate, revoke)."""
from fastapi import APIRouter

router = APIRouter(prefix="/api-keys", tags=["api_keys"])

@router.get("/")
async def list_api_keys():
    return {"api_keys": []}
