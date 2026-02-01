"""Common reusable schemas (pagination, error responses)."""
from pydantic import BaseModel
from typing import Optional

class ErrorResponse(BaseModel):
    error: str
    message: Optional[str]

class Pagination(BaseModel):
    limit: int
    offset: int
