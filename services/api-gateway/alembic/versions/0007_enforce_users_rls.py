"""Enforce PostgreSQL RLS policies for tenant-scoped users.

Revision ID: 0007_enforce_users_rls
Revises: 0006_uuid_user_tenant_ids
Create Date: 2026-04-07
"""

from alembic import op
import sqlalchemy as sa


revision = "0007_enforce_users_rls"
down_revision = "0006_uuid_user_tenant_ids"
branch_labels = None
depends_on = None


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if not _is_postgres():
        return

    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE users FORCE ROW LEVEL SECURITY")
    op.execute("DROP POLICY IF EXISTS users_tenant_isolation ON users")
    op.execute(
        sa.text(
            """
            CREATE POLICY users_tenant_isolation ON users
            USING (tenant_id = current_setting('app.current_tenant', true))
            WITH CHECK (tenant_id = current_setting('app.current_tenant', true))
            """
        )
    )


def downgrade() -> None:
    if not _is_postgres():
        return

    op.execute("DROP POLICY IF EXISTS users_tenant_isolation ON users")
    op.execute("ALTER TABLE users NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY")
