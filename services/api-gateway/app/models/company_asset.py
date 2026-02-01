"""Company assets (logos, templates, signatures)"""
from sqlalchemy import Column, Integer, String, ForeignKey
from .base import Base

class CompanyAsset(Base):
    __tablename__ = 'company_assets'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'))
    asset_type = Column(String)
    path = Column(String)
