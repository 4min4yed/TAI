"""Audit log model (immutable, hash-chained)."""
from sqlalchemy import Column, Integer, String, DateTime, func
from .base import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True)
    event_type = Column(String)
    payload_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
