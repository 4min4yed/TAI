"""Authentication endpoints (login, refresh rotation, logout, reset password, 2FA)."""

from __future__ import annotations
import secrets
from datetime import timedelta
from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from app.core.config import Settings
from app.core.dependencies import get_db
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordConfirmRequest,
    ForgotPasswordRequest,
    GenericAuthActionResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MFAEnableRequest,
    MFAVerifyLoginRequest,
    NotMeRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    VerifyEmailConfirmRequest,
    VerifyEmailConfirmResponse,
    VerifyEmailValidateRequest,
    VerifyEmailValidateResponse,
)
from app.security.auth import login_user
from app.security.auth.email_verif import (
    consume_token,
    get_valid_token_record,
    invalidate_token_by_raw_token,
    issue_verification_token,
    send_verification_email,
)
from app.security.auth.jwt_handler import (
    create_mfa_challenge_token,
    token_expiry_from_claims,
    verify_jwt,
)
from app.security.auth.mfa_handler import build_totp_uri, generate_totp_secret, verify_totp
from app.security.auth.rate_limit import auth_rate_limiter
from app.security.auth.register import register_tenant
from app.security.auth.session_manager import SessionManager
from app.security.auth.token_store import (
    as_utc,
    blacklist_token,
    find_refresh_by_jti,
    get_valid_password_reset_token,
    invalidate_user_refresh_tokens,
    issue_password_reset_token,
    is_blacklisted,
    mark_refresh_used,
    revoke_refresh_family,
    utc_now,
)

PENDING_PASSWORD_PREFIX = "!pending!"

settings = Settings()
router = APIRouter(prefix="/auth", tags=["auth"])


async def _send_password_reset_email(email: str, reset_token: str) -> bool:
    from app.security.auth.email_verif import _send_email_sync  # local import to avoid circular deps

    reset_url = f"{settings.FRONTEND_URL}/forgot-password?token={reset_token}"
    ttl = max(5, settings.PASSWORD_RESET_TTL_MINUTES)
    text_body = (
        "Password Reset - TAI Platform\n\n"
        "We received a request to reset your password.\n\n"
        f"Reset now: {reset_url}\n\n"
        f"This link expires in {ttl} minutes.\n"
    )
    html_body = f"""
    <html>
      <body style=\"font-family: Arial, sans-serif;\">
        <h2>Password Reset - TAI Platform</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a href=\"{reset_url}\" style=\"background-color:#0b7285;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;\">Reset Password</a>
        </p>
        <p>Or copy this link:</p>
        <p><code>{reset_url}</code></p>
        <p style=\"font-size:12px;color:#666;\">This link expires in {ttl} minutes.</p>
      </body>
    </html>
    """
    return await __import__("asyncio").to_thread(_send_email_sync, email, text_body, html_body)


def _client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if forwarded_for:
        return forwarded_for
    if request.client and request.client.host:
        return request.client.host
    return None


def _set_auth_cookies(response: Response, refresh_token: str) -> str:
    csrf_token = secrets.token_urlsafe(32)
    cookie_kwargs = {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "path": "/",
    }
    if settings.AUTH_COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.AUTH_COOKIE_DOMAIN

    response.set_cookie(settings.REFRESH_COOKIE_NAME, refresh_token, **cookie_kwargs)
    response.set_cookie(
        settings.CSRF_COOKIE_NAME,
        csrf_token,
        httponly=False,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
        domain=settings.AUTH_COOKIE_DOMAIN or None,
    )
    return csrf_token


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/", domain=settings.AUTH_COOKIE_DOMAIN or None)
    response.delete_cookie(settings.CSRF_COOKIE_NAME, path="/", domain=settings.AUTH_COOKIE_DOMAIN or None)


def _read_refresh_token(request: Request, payload_refresh: str | None) -> tuple[str | None, bool]:
    if payload_refresh:
        return payload_refresh.strip(), False
    cookie_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    return (cookie_token.strip() if cookie_token else None), True


def _require_csrf(request: Request, from_cookie: bool, x_csrf_token: str | None) -> None:
    if not from_cookie:
        return
    cookie_csrf = request.cookies.get(settings.CSRF_COOKIE_NAME)
    if not cookie_csrf:
        raise HTTPException(status_code=403, detail="Missing CSRF cookie")
    if not x_csrf_token or x_csrf_token.strip() != cookie_csrf:
        raise HTTPException(status_code=403, detail="Invalid CSRF token")


def _get_access_claims(request: Request) -> dict:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        claims = verify_jwt(token, expected_type="access")
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid bearer token") from exc

    jti = claims.get("jti")
    if jti and is_blacklisted(request.state.db, str(jti)):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    return claims


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request, response: Response, db=Depends(get_db)):
    request.state.db = db
    result = await login_user(
        db,
        payload.email,
        payload.password,
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    if result.get("mfa_required"):
        return {
            "mfa_required": True,
            "mfa_token": result["mfa_token"],
            "user": result["user"],
        }

    _set_auth_cookies(response, result["refresh_token"])
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "mfa_required": False,
        "user": result["user"],
    }


@router.post("/2fa/verify-login", response_model=LoginResponse)
async def verify_login_2fa(payload: MFAVerifyLoginRequest, request: Request, response: Response, db=Depends(get_db)):
    request.state.db = db
    try:
        challenge = verify_jwt(payload.mfa_token, expected_type="mfa_challenge")
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid MFA challenge") from exc

    user = db.query(User).filter(User.id == str(challenge.get("sub"))).first()
    if not user or not user.is_active or not user.is_verified:
        raise HTTPException(status_code=401, detail="Invalid user")
    if not user.is_2fa_enabled or not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled")
    if not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")

    tenant_name = ""
    manager = SessionManager()
    result = manager.create_session(
        db,
        user_id=user.id,
        tenant_id=user.tenant_id,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        tenant_name=tenant_name,
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    _set_auth_cookies(response, result["refresh_token"])
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "mfa_required": False,
        "user": result["user"],
    }


@router.post("/refresh", response_model=LoginResponse)
async def refresh_session(
    payload: RefreshRequest,
    request: Request,
    response: Response,
    x_csrf_token: str | None = Header(default=None, alias="X-CSRF-Token"),
    db=Depends(get_db),
):
    request.state.db = db
    raw_refresh, from_cookie = _read_refresh_token(request, payload.refresh_token)
    if not raw_refresh:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Missing refresh token")

    _require_csrf(request, from_cookie, x_csrf_token)

    try:
        claims = verify_jwt(raw_refresh, expected_type="refresh")
    except Exception as exc:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

    jti = str(claims.get("jti", ""))
    family = str(claims.get("family", ""))
    if not jti or not family:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    record = find_refresh_by_jti(db, jti)
    now = utc_now()
    if not record or as_utc(record.expires_at) < now:
        if family:
            revoke_refresh_family(db, family, reason="refresh_reuse_detected")
            db.commit()
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Refresh token expired")

    if record.revoked_at is not None or record.used_at is not None:
        revoke_refresh_family(db, record.token_family, reason="refresh_reuse_detected")
        db.commit()
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Refresh token reuse detected")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or not user.is_active or not user.is_verified:
        revoke_refresh_family(db, record.token_family, reason="user_inactive")
        db.commit()
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="User not active")

    manager = SessionManager()
    result = manager.create_session(
        db,
        user_id=user.id,
        tenant_id=user.tenant_id,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        tenant_name="",
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        refresh_family=record.token_family,
        parent_refresh_jti=record.jti,
    )
    mark_refresh_used(db, record, replaced_by_jti=result["refresh_jti"])
    db.commit()

    _set_auth_cookies(response, result["refresh_token"])
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "mfa_required": False,
        "user": result["user"],
    }


@router.post("/logout", response_model=GenericAuthActionResponse)
async def logout(
    payload: LogoutRequest,
    request: Request,
    response: Response,
    x_csrf_token: str | None = Header(default=None, alias="X-CSRF-Token"),
    db=Depends(get_db),
):
    request.state.db = db
    raw_refresh, from_cookie = _read_refresh_token(request, payload.refresh_token)
    _require_csrf(request, from_cookie, x_csrf_token)

    if raw_refresh:
        try:
            refresh_claims = verify_jwt(raw_refresh, expected_type="refresh")
            record = find_refresh_by_jti(db, str(refresh_claims.get("jti", "")))
            if record:
                revoke_refresh_family(db, record.token_family, reason="logout")
        except Exception:
            pass

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        access_token = auth_header.split(" ", 1)[1].strip()
        if access_token:
            try:
                access_claims = verify_jwt(access_token, expected_type="access")
                blacklist_token(
                    db,
                    jti=str(access_claims.get("jti")),
                    token_type="access",
                    user_id=str(access_claims.get("sub")),
                    expires_at=token_expiry_from_claims(access_claims),
                    reason="manual_logout",
                )
            except Exception:
                pass

    db.commit()
    _clear_auth_cookies(response)
    return {"status": "ok", "message": "Session terminated"}


@router.post("/forgot-password/request", response_model=GenericAuthActionResponse)
async def forgot_password_request(payload: ForgotPasswordRequest, db=Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    default_response = {
        "status": "accepted",
        "message": "If an account exists, reset instructions have been sent.",
    }

    if not auth_rate_limiter.allow(f"forgot:{normalized_email}", max_attempts=5, window_seconds=60 * 60):
        return default_response

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not user.is_active:
        return default_response

    raw_token = secrets.token_urlsafe(48)
    expires_at = utc_now() + timedelta(minutes=max(5, settings.PASSWORD_RESET_TTL_MINUTES))
    issue_password_reset_token(db, user.id, user.email, raw_token, expires_at)
    await _send_password_reset_email(user.email, raw_token)
    return default_response


@router.post("/forgot-password/confirm", response_model=GenericAuthActionResponse)
async def forgot_password_confirm(payload: ForgotPasswordConfirmRequest, db=Depends(get_db)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    record = get_valid_password_reset_token(db, payload.token)
    if not record:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")

    user.password_hash = hash_password(payload.new_password)
    invalidate_user_refresh_tokens(db, user.id, reason="password_reset")
    record.is_used = True
    record.used_at = utc_now()
    db.commit()
    return {"status": "ok", "message": "Password updated successfully"}


@router.post("/2fa/setup", response_model=dict)
async def setup_2fa(request: Request, db=Depends(get_db)):
    request.state.db = db
    claims = _get_access_claims(request)
    user = db.query(User).filter(User.id == str(claims.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.totp_secret:
        user.totp_secret = generate_totp_secret()
        db.commit()

    return {
        "secret": user.totp_secret,
        "otpauth_uri": build_totp_uri(user.email, user.totp_secret),
        "is_2fa_enabled": bool(user.is_2fa_enabled),
    }


@router.post("/2fa/enable", response_model=GenericAuthActionResponse)
async def enable_2fa(payload: MFAEnableRequest, request: Request, db=Depends(get_db)):
    request.state.db = db
    claims = _get_access_claims(request)
    user = db.query(User).filter(User.id == str(claims.get("sub"))).first()
    if not user or not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup required first")
    if not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")

    user.is_2fa_enabled = True
    db.commit()
    return {"status": "ok", "message": "2FA enabled"}


@router.post("/2fa/disable", response_model=GenericAuthActionResponse)
async def disable_2fa(payload: MFAEnableRequest, request: Request, db=Depends(get_db)):
    request.state.db = db
    claims = _get_access_claims(request)
    user = db.query(User).filter(User.id == str(claims.get("sub"))).first()
    if not user or not user.totp_secret or not user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled")
    if not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")

    user.is_2fa_enabled = False
    db.commit()
    return {"status": "ok", "message": "2FA disabled"}


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
        return {
            "valid": False,
            "message": "Verification link is invalid or has expired.",
            "requires_password_setup": False,
        }

    user = db.query(User).filter(User.id == record.user_id).first()
    requires_password_setup = bool(user and user.password_hash.startswith(PENDING_PASSWORD_PREFIX))
    message = (
        "Token is valid. Set and confirm your password to activate the account."
        if requires_password_setup
        else "Token is valid. Confirm with your password."
    )
    return {
        "valid": True,
        "message": message,
        "requires_password_setup": requires_password_setup,
    }


@router.post("/verify-email/confirm", response_model=VerifyEmailConfirmResponse)
async def confirm_verification(payload: VerifyEmailConfirmRequest, db=Depends(get_db)):
    record = get_valid_token_record(db, payload.token)
    if not record:
        return {"status": "invalid", "message": "Verification link is invalid or has expired."}

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or user.is_verified:
        return {"status": "invalid", "message": "Verification link is invalid or has expired."}

    if user.password_hash.startswith(PENDING_PASSWORD_PREFIX):
        if not payload.new_password or not payload.confirm_password:
            return {
                "status": "invalid_credentials",
                "message": "Please provide and confirm your new password.",
            }
        if payload.new_password != payload.confirm_password:
            return {
                "status": "invalid_credentials",
                "message": "Passwords do not match.",
            }
        if len(payload.new_password) < 8:
            return {
                "status": "invalid_credentials",
                "message": "Password must be at least 8 characters long.",
            }
        user.password_hash = hash_password(payload.new_password)
    else:
        if not payload.password or not verify_password(user.password_hash, payload.password):
            return {"status": "invalid_credentials", "message": "Password is incorrect."}

    user.is_verified = True
    user.is_active = True
    consume_token(db, record)
    return {"status": "verified", "message": "Email verified. Please log in."}


@router.post("/resend-verification", response_model=GenericAuthActionResponse)
async def resend_verification(payload: ResendVerificationRequest, db=Depends(get_db)):
    normalized_email = payload.email.strip().lower()
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
