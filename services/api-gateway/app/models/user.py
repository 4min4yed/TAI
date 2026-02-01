"""User model (credentials, roles, 2FA).

Some fields (password_hash, totp_secret) should be encrypted or stored in Vault in prod.
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from .base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
