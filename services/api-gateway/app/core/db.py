"""Database session management (SQLAlchemy sessionmaker)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .rls import apply_rls_context_to_db_session
from .tenant_context import get_current_tenant_id

engine = None
SessionLocal = None


def init_db(url: str):
    global engine, SessionLocal
    engine = create_engine(url, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    if SessionLocal is None:
        raise RuntimeError("DB not initialized")
    db = SessionLocal()
    try:
        tenant_id = get_current_tenant_id()
        if tenant_id:
            apply_rls_context_to_db_session(db, tenant_id)
        yield db
    finally:
        db.close()