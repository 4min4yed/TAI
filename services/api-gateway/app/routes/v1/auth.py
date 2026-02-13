"""Authentication endpoints (login, refresh, logout)."""

from fastapi import APIRouter, Depends
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.core.dependencies import get_db
from app.security.auth import login_user
from app.security.auth.register import register_tenant

router = APIRouter(tags=["auth"]) 
router = APIRouter(prefix="/auth", tags=["auth"]) # forces /auth/XYZ for all routes in this file

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    return await login_user(db, payload.email, payload.password)


@router.post("/register", response_model=RegisterResponse)
async def register(payload: RegisterRequest, db=Depends(get_db)):
    print("Registering user with payload:", payload)
    return {payload, await register_tenant(db, payload.tenant_name, payload.email, payload.password, payload.firstName, payload.lastName)}

