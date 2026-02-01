"""Document model (tender documents) with tenant association."""
from sqlalchemy import Column, Integer, String, ForeignKey
from .base import Base

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'))
    filename = Column(String)
    path = Column(String)
