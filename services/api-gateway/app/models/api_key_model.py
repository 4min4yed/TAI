"""API key model for service authentication."""
from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from .base import Base

class APIKey(Base):
    __tablename__ = 'api_keys'
    id = Column(Integer, primary_key=True)
    key_hash = Column(String, nullable=False)
    scopes = Column(String)
    disabled = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
