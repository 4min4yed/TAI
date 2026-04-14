"""Audit log model (immutable, hash-chained)."""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from .base import Base


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True)
    tenant_id = Column(String(36), ForeignKey('tenants.id'), nullable=False, index=True)
    actor_user_id = Column(String(36), ForeignKey('users.id'), nullable=True, index=True)
    event_type = Column(String)
    payload_hash = Column(String, nullable=False)
    previous_hash = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
