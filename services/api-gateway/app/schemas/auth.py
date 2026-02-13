"""Auth request/response schemas."""
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    tenant_name: str
    email: str
    password: str
    firstName: str
    lastName: str

class RegisterResponse(BaseModel):
    id: int
    email: str
    tenant_id: int
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
