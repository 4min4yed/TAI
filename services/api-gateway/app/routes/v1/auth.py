"""Authentication endpoints (login, refresh, logout)."""
from fastapi import APIRouter

router = APIRouter(tags=["auth"])

@router.post("/login")
async def login():
    return {"access_token": "<stub>"}
