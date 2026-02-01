"""User schemas."""
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    email: str

class UserCreate(BaseModel):
    email: str
    password: str
