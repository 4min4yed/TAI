"""Email-based login verification code helpers."""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import secrets
from datetime import timedelta

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.auth_security import LoginEmailCode
from app.security.auth.email_verif import _send_email_sync
from app.security.auth.token_store import as_utc, utc_now

settings = Settings()


def hash_email_login_code(raw_code: str) -> str:
    digest_input = f"{settings.SECRET_KEY}:{raw_code}".encode("utf-8")
    return hashlib.sha256(digest_input).hexdigest()


def generate_email_login_code() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def issue_login_email_code(db: Session, *, challenge_jti: str, user_id: str, email: str) -> str:
    ttl_minutes = max(1, min(settings.EMAIL_LOGIN_2FA_TTL_MINUTES, 60))
    raw_code = generate_email_login_code()

    db.query(LoginEmailCode).filter(
        LoginEmailCode.user_id == user_id,
        LoginEmailCode.is_used.is_(False),
        LoginEmailCode.invalidated_at.is_(None),
    ).update(
        {
            "invalidated_at": utc_now(),
            "invalidation_reason": "superseded",
        },
        synchronize_session=False,
    )

    record = LoginEmailCode(
        challenge_jti=challenge_jti,
        user_id=user_id,
        email=email,
        code_hash=hash_email_login_code(raw_code),
        expires_at=utc_now() + timedelta(minutes=ttl_minutes),
        max_attempts=max(3, min(settings.EMAIL_LOGIN_2FA_MAX_ATTEMPTS, 10)),
    )
    db.add(record)
    db.flush()
    return raw_code


def get_valid_login_email_code(db: Session, *, challenge_jti: str, user_id: str) -> LoginEmailCode | None:
    record = db.query(LoginEmailCode).filter(
        LoginEmailCode.challenge_jti == challenge_jti,
        LoginEmailCode.user_id == user_id,
    ).first()
    if not record:
        return None
    if record.is_used or record.invalidated_at is not None:
        return None
    if as_utc(record.expires_at) < utc_now():
        return None
    if record.failed_attempts >= record.max_attempts:
        return None
    return record


def verify_login_email_code(record: LoginEmailCode, raw_code: str) -> bool:
    expected = hash_email_login_code(str(raw_code).strip())
    return hmac.compare_digest(record.code_hash, expected)


def mark_login_email_code_failed(db: Session, record: LoginEmailCode) -> None:
    record.failed_attempts = int(record.failed_attempts or 0) + 1
    if record.failed_attempts >= record.max_attempts and record.invalidated_at is None:
        record.invalidated_at = utc_now()
        record.invalidation_reason = "max_attempts_exceeded"
    db.commit()


def consume_login_email_code(db: Session, record: LoginEmailCode) -> None:
    record.is_used = True
    record.used_at = utc_now()
    db.commit()


async def send_login_email_code(email: str, code: str) -> bool:
    ttl = max(1, min(settings.EMAIL_LOGIN_2FA_TTL_MINUTES, 60))
    text_body = (
        "Your Login Verification Code - TAI Platform\n\n"
        "Use the following one-time code to complete your login:\n\n"
        f"{code}\n\n"
        f"This code expires in {ttl} minutes and can only be used once.\n"
    )

    html_body = f"""
    <html>
      <body style=\"font-family: Arial, sans-serif;\">
        <h2>Your Login Verification Code</h2>
        <p>Use this one-time code to complete your login:</p>
        <p style=\"font-size:28px;font-weight:700;letter-spacing:4px;\">{code}</p>
        <p style=\"font-size:12px;color:#666;\">This code expires in {ttl} minutes and can only be used once.</p>
      </body>
    </html>
    """
    return await asyncio.to_thread(_send_email_sync, email, text_body, html_body)
