"""Authentication endpoints (login, refresh, logout)."""

from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.auth import (
    GenericAuthActionResponse,
    LoginRequest,
    LoginResponse,
    NotMeRequest,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    VerifyEmailConfirmRequest,
    VerifyEmailConfirmResponse,
    VerifyEmailValidateRequest,
    VerifyEmailValidateResponse,
)
from app.core.dependencies import get_db
from app.core.security import verify_password
from app.security.auth import login_user
from app.security.auth.email_verif import (
    consume_token,
    get_valid_token_record,
    invalidate_token_by_raw_token,
    issue_verification_token,
    send_verification_email,
)
from app.security.auth.rate_limit import auth_rate_limiter
from app.security.auth.register import register_tenant

router = APIRouter(tags=["auth"]) 
router = APIRouter(prefix="/auth", tags=["auth"]) # forces /auth/XYZ for all routes in this file

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    return await login_user(db, payload.email, payload.password)


@router.post("/register", response_model=RegisterResponse)
async def register(payload: RegisterRequest, db=Depends(get_db)):
    return await register_tenant(
        db,
        payload.tenant_name,
        payload.email,
        payload.password,
        payload.firstName,
        payload.lastName,
    )


@router.post("/verify-email/validate", response_model=VerifyEmailValidateResponse)
async def validate_verification_token(payload: VerifyEmailValidateRequest, db=Depends(get_db)):
    record = get_valid_token_record(db, payload.token)
    if not record:
        return {"valid": False, "message": "Verification link is invalid or has expired."}
    return {"valid": True, "message": "Token is valid. Confirm with your password."}


@router.post("/verify-email/confirm", response_model=VerifyEmailConfirmResponse)
async def confirm_verification(payload: VerifyEmailConfirmRequest, db=Depends(get_db)):
    record = get_valid_token_record(db, payload.token)
    if not record:
        return {"status": "invalid", "message": "Verification link is invalid or has expired."}

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or user.is_verified:
        return {"status": "invalid", "message": "Verification link is invalid or has expired."}

    if not verify_password(user.password_hash, payload.password):
        return {"status": "invalid_credentials", "message": "Password is incorrect."}

    user.is_verified = True
    consume_token(db, record)
    return {"status": "verified", "message": "Email verified. Please log in."}


@router.post("/resend-verification", response_model=GenericAuthActionResponse)
async def resend_verification(payload: ResendVerificationRequest, db=Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    # Silent response to reduce account enumeration.
    default_response = {
        "status": "accepted",
        "message": "If an account exists, we've sent instructions.",
    }

    if not auth_rate_limiter.allow(f"resend:{normalized_email}", max_attempts=3, window_seconds=60 * 60):
        return default_response

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or user.is_verified:
        return default_response

    token = issue_verification_token(db, user.id, user.email)
    await send_verification_email(user.email, user.id, token)
    return default_response


@router.post("/verify-email/not-me", response_model=GenericAuthActionResponse)
async def not_me(payload: NotMeRequest, db=Depends(get_db)):
    default_response = {
        "status": "accepted",
        "message": "If a pending signup exists, it has been canceled.",
    }

    record = get_valid_token_record(db, payload.token)
    if not record:
        return default_response

    user = db.query(User).filter(User.id == record.user_id).first()
    invalidate_token_by_raw_token(db, payload.token, reason="not_me")
    if user and not user.is_verified:
        db.delete(user)
        db.commit()

    return default_response

