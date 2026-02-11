"""Tenant schemas."""
from pydantic import BaseModel

class TenantCreate(BaseModel):
    name: str
    description: str | None = None

class TenantResponse(BaseModel):
    id: int
    name: str
