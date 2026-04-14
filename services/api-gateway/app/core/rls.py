"""Row-Level Security helpers: binding tenant context for DB sessions.

Pattern: middleware derives tenant context from the authenticated request and
binds it with `SET LOCAL app.current_tenant = <tenant_id>` for the current
transaction only.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def bind_tenant_to_session(connection, tenant_id: str):
    connection.execute(text("SET LOCAL app.current_tenant = :tenant_id"), {"tenant_id": tenant_id})


def apply_rls_context_to_db_session(db: Session, tenant_id: str) -> None:
    """Bind tenant context on the live DB connection used by this Session."""
    bind = db.get_bind()
    if bind is None:
        return
    if bind.dialect.name != "postgresql":
        return
    bind_tenant_to_session(db.connection(), tenant_id)
