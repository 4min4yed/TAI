"""Row-Level Security helpers: binding tenant context for DB sessions.

Pattern: middleware sets `SET app.current_tenant = <id>` on connection per request.
"""


def bind_tenant_to_session(connection, tenant_id: int):
    # Use raw SQL to set local session variable for postgres row level policies
    connection.execute("SET app.current_tenant = %s;" % tenant_id)
