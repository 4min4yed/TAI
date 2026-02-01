"""Tenant model (organization accounts)."""
from sqlalchemy import Column, Integer, String
from .base import Base

class Tenant(Base):
    __tablename__ = 'tenants'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
