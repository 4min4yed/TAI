"""Document model (tender documents) with tenant association."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from .base import Base


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(String(36), ForeignKey('tenants.id'))
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)
    doc_type = Column(String, nullable=False, default='General')
    department = Column(String, nullable=False, default='General')
    status = Column(String, nullable=False, default='uploaded')
    mime_type = Column(String, nullable=False, default='application/octet-stream')
    size_bytes = Column(Integer, nullable=False, default=0)
    uploaded_by_user_id = Column(String(36), ForeignKey('users.id'), nullable=True)
    tags = Column(String, nullable=False, default='')
    created_at_utc = Column(DateTime(timezone=True), nullable=False, default=_utc_now)
    updated_at_utc = Column(DateTime(timezone=True), nullable=False, default=_utc_now, onupdate=_utc_now)
