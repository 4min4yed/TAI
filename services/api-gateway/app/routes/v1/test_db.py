"""Database schema inspection endpoint for debugging."""
from fastapi import APIRouter
from sqlalchemy import inspect

from app.core.db import engine

router = APIRouter(prefix="/db", tags=["db"])


@router.get("/")
def show_db_schema():
    if engine is None:
        return {"detail": "Database not initialized"}

    inspector = inspect(engine)
    schema = {}
    for table in inspector.get_table_names():
        schema[table] = inspector.get_columns(table)

    return {"schema": schema}
