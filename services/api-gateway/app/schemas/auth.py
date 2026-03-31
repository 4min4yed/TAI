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
    status: str
    message: str


class VerifyEmailValidateRequest(BaseModel):
    token: str


class VerifyEmailValidateResponse(BaseModel):
    valid: bool
    message: str


class VerifyEmailConfirmRequest(BaseModel):
    token: str
    password: str


class VerifyEmailConfirmResponse(BaseModel):
    status: str
    message: str


class ResendVerificationRequest(BaseModel):
    email: str


class GenericAuthActionResponse(BaseModel):
    status: str
    message: str


class NotMeRequest(BaseModel):
    token: str
