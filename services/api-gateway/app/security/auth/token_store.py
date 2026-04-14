"""Persistent token store helpers for rotation, blacklist, and password reset."""

from __future__ import annotations
import hashlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.auth_security import JWTBlacklist, PasswordResetToken, RefreshToken

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def hash_raw_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

def persist_refresh_token(
    db: Session,
    *,
    raw_token: str,
    jti: str,
    user_id: str,
    tenant_id: str,
    family_id: str,
    expires_at: datetime,
    parent_jti: str | None,
    ip_address: str | None,
    user_agent: str | None,
) -> RefreshToken:
    record = RefreshToken(
        jti=jti,
        user_id=user_id,
        tenant_id=tenant_id,
        token_family=family_id,
        parent_jti=parent_jti,
        token_hash=hash_raw_token(raw_token),
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=(user_agent or "")[:256] or None,
    )
    db.add(record)
    db.flush()
    return record

def find_refresh_by_jti(db: Session, jti: str) -> RefreshToken | None:
    return db.query(RefreshToken).filter(RefreshToken.jti == jti).first()

def is_blacklisted(db: Session, jti: str) -> bool:
    record = db.query(JWTBlacklist).filter(JWTBlacklist.jti == jti).first()
    if not record:
        return False
    return as_utc(record.expires_at) >= utc_now()

def blacklist_token(db: Session, *, jti: str, token_type: str, user_id: str | None, expires_at: datetime, reason: str) -> None:
    existing = db.query(JWTBlacklist).filter(JWTBlacklist.jti == jti).first()
    if existing:
        return
    db.add(
        JWTBlacklist(
            jti=jti,
            token_type=token_type,
            user_id=user_id,
            expires_at=expires_at,
            reason=reason,
        )
    )

def revoke_refresh_family(db: Session, family_id: str, reason: str) -> None:
    now = utc_now()
    db.query(RefreshToken).filter(
        RefreshToken.token_family == family_id,
        RefreshToken.revoked_at.is_(None),
    ).update(
        {
            "revoked_at": now,
            "reuse_detected": True if reason == "refresh_reuse_detected" else RefreshToken.reuse_detected,
        },
        synchronize_session=False,
    )

def mark_refresh_used(db: Session, record: RefreshToken, replaced_by_jti: str | None = None) -> None:
    record.used_at = utc_now()
    if replaced_by_jti:
        record.replaced_by_jti = replaced_by_jti


def invalidate_user_refresh_tokens(db: Session, user_id: str, reason: str) -> None:
    now = utc_now()
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None),
    ).update({"revoked_at": now}, synchronize_session=False)
def issue_password_reset_token(db: Session, user_id: str, email: str, raw_token: str, expires_at: datetime) -> PasswordResetToken:
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.is_used.is_(False),
        PasswordResetToken.invalidated_at.is_(None),
    ).update(
        {"invalidated_at": utc_now(), "invalidation_reason": "superseded"},
        synchronize_session=False,
    )

    token = PasswordResetToken(
        user_id=user_id,
        email=email,
        token_hash=hash_raw_token(raw_token),
        expires_at=expires_at,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token

def get_valid_password_reset_token(db: Session, raw_token: str) -> PasswordResetToken | None:
    token_hash = hash_raw_token(raw_token)
    record = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()
    if not record:
        return None
    if record.is_used or record.invalidated_at is not None:
        return None
    if as_utc(record.expires_at) < utc_now():
        return None
    return record


def consume_password_reset_token(db: Session, record: PasswordResetToken) -> None:
    record.is_used = True
    record.used_at = utc_now()
    db.commit()
