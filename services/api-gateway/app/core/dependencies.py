"""FastAPI dependency injection helpers (get_current_user, get_db)."""
from typing import Generator
from fastapi import Depends, HTTPException
from .db import get_db


def get_current_user():
    # Stub: extract user from JWT or API key
    raise HTTPException(status_code=401, detail="Not implemented")


def get_db_dep() -> Generator:
    yield from get_db()
