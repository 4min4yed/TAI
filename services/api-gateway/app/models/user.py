"""User model (credentials, roles, 2FA).

Some fields (password_hash, totp_secret) should be encrypted or stored in Vault in prod.
"""
import uuid

from sqlalchemy import Column, String, Boolean, ForeignKey
from .base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    tenant_id = Column(String(36), ForeignKey('tenants.id'), nullable=False)
    role = Column(String, nullable=False, default='user')
    is_active = Column(Boolean, default=True)
    is_2fa_enabled = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    totp_secret = Column(String(64), nullable=True)
