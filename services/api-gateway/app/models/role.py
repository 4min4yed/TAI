"""Role model (RBAC roles + permissions)."""
from sqlalchemy import Column, Integer, String
from .base import Base

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    permissions = Column(String)  # comma-separated list or JSON in prod
