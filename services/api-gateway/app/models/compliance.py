"""Compliance report model."""
from sqlalchemy import Column, Integer, String, ForeignKey
from .base import Base

class Compliance(Base):
    __tablename__ = 'compliance_reports'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(String(36), ForeignKey('tenants.id'))
    score = Column(Integer)
    details = Column(String)
