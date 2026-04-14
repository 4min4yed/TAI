"""Enforce PostgreSQL RLS policies for tenant-scoped documents.

Revision ID: 0008_enforce_documents_rls
Revises: 0007_enforce_users_rls
Create Date: 2026-04-07
"""

from alembic import op
import sqlalchemy as sa


revision = "0008_enforce_documents_rls"
down_revision = "0007_enforce_users_rls"
branch_labels = None
depends_on = None


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if not _is_postgres():
        return

    op.execute("ALTER TABLE documents ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE documents FORCE ROW LEVEL SECURITY")
    op.execute("DROP POLICY IF EXISTS documents_tenant_isolation ON documents")
    op.execute(
        sa.text(
            """
            CREATE POLICY documents_tenant_isolation ON documents
            USING (tenant_id = current_setting('app.current_tenant', true))
            WITH CHECK (tenant_id = current_setting('app.current_tenant', true))
            """
        )
    )


def downgrade() -> None:
    if not _is_postgres():
        return

    op.execute("DROP POLICY IF EXISTS documents_tenant_isolation ON documents")
    op.execute("ALTER TABLE documents NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE documents DISABLE ROW LEVEL SECURITY")
