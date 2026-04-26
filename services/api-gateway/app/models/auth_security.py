"""Auth security persistence models (refresh rotation, blacklist, password reset)."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func

from .base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    jti = Column(String(36), nullable=False, unique=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    tenant_id = Column(String(36), nullable=False, index=True)
    token_family = Column(String(36), nullable=False, index=True)
    parent_jti = Column(String(36), nullable=True)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    replaced_by_jti = Column(String(36), nullable=True)
    reuse_detected = Column(Boolean, nullable=False, default=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(256), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class JWTBlacklist(Base):
    __tablename__ = "jwt_blacklist"

    id = Column(Integer, primary_key=True)
    jti = Column(String(64), nullable=False, unique=True, index=True)
    token_type = Column(String(16), nullable=False)
    user_id = Column(String(36), nullable=True, index=True)
    reason = Column(String(64), nullable=False, default="manual_logout")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    invalidated_at = Column(DateTime(timezone=True), nullable=True)
    invalidation_reason = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class LoginEmailCode(Base):
    __tablename__ = "login_email_codes"

    id = Column(Integer, primary_key=True)
    challenge_jti = Column(String(36), nullable=False, unique=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    code_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    failed_attempts = Column(Integer, nullable=False, default=0)
    max_attempts = Column(Integer, nullable=False, default=5)
    is_used = Column(Boolean, nullable=False, default=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    invalidated_at = Column(DateTime(timezone=True), nullable=True)
    invalidation_reason = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
