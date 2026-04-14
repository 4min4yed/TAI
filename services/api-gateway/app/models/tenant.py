"""Tenant model (organization accounts)."""
import uuid

from sqlalchemy import Column, String
from .base import Base

class Tenant(Base):
    __tablename__ = 'tenants'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
