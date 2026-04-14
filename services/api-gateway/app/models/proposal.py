"""Proposal model (generated DOCX/PDF)"""
from sqlalchemy import Column, Integer, String, ForeignKey
from .base import Base

class Proposal(Base):
    __tablename__ = 'proposals'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(String(36), ForeignKey('tenants.id'))
    file_path = Column(String)
