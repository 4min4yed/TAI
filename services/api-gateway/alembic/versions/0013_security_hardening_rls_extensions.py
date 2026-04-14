"""Expand RLS coverage and harden audit log immutability.

Revision ID: 0013_security_hardening_rls_extensions
Revises: 0012_auth_security_core
Create Date: 2026-04-10
"""

from alembic import op


revision = "0013_security_hardening_rls_extensions"
down_revision = "0012_auth_security_core"
branch_labels = None
depends_on = None


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if not _is_postgres():
        return

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            tenant_id VARCHAR(36),
            actor_user_id VARCHAR(36),
            event_type VARCHAR,
            payload_hash VARCHAR NOT NULL,
            previous_hash VARCHAR,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    op.execute("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36)")
    op.execute("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_user_id VARCHAR(36)")
    op.execute("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_hash VARCHAR")
    op.execute("CREATE INDEX IF NOT EXISTS ix_audit_logs_tenant_id ON audit_logs (tenant_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_audit_logs_actor_user_id ON audit_logs (actor_user_id)")

    op.execute(
        """
        CREATE OR REPLACE FUNCTION block_audit_log_mutation()
        RETURNS trigger AS $$
        BEGIN
            RAISE EXCEPTION 'audit_logs are immutable';
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute("DROP TRIGGER IF EXISTS trg_block_audit_log_update ON audit_logs")
    op.execute("DROP TRIGGER IF EXISTS trg_block_audit_log_delete ON audit_logs")
    op.execute(
        """
        CREATE TRIGGER trg_block_audit_log_update
        BEFORE UPDATE ON audit_logs
        FOR EACH ROW
        EXECUTE FUNCTION block_audit_log_mutation()
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_block_audit_log_delete
        BEFORE DELETE ON audit_logs
        FOR EACH ROW
        EXECUTE FUNCTION block_audit_log_mutation()
        """
    )

    op.execute("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY")
    op.execute("DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs")
    op.execute(
        """
        CREATE POLICY audit_logs_tenant_isolation ON audit_logs
        USING (tenant_id = current_setting('app.current_tenant', true))
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true))
        """
    )

    # Expand tenant isolation to additional tenant-scoped tables.
    for table_name, policy_name in (
        ("company_assets", "company_assets_tenant_isolation"),
        ("refresh_tokens", "refresh_tokens_tenant_isolation"),
        ("proposals", "proposals_tenant_isolation"),
        ("compliance_reports", "compliance_reports_tenant_isolation"),
    ):
        op.execute(
            f"""
            DO $$
            BEGIN
                IF to_regclass('{table_name}') IS NOT NULL THEN
                    EXECUTE 'ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY';
                    EXECUTE 'ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY';
                    EXECUTE 'DROP POLICY IF EXISTS {policy_name} ON {table_name}';
                    EXECUTE format(
                        'CREATE POLICY %I ON %I USING (tenant_id = current_setting(''app.current_tenant'', true)) WITH CHECK (tenant_id = current_setting(''app.current_tenant'', true))',
                        '{policy_name}',
                        '{table_name}'
                    );
                END IF;
            END
            $$;
            """
        )


def downgrade() -> None:
    if not _is_postgres():
        return

    for table_name, policy_name in (
        ("compliance_reports", "compliance_reports_tenant_isolation"),
        ("proposals", "proposals_tenant_isolation"),
        ("refresh_tokens", "refresh_tokens_tenant_isolation"),
        ("company_assets", "company_assets_tenant_isolation"),
    ):
        op.execute(
            f"""
            DO $$
            BEGIN
                IF to_regclass('{table_name}') IS NOT NULL THEN
                    EXECUTE 'DROP POLICY IF EXISTS {policy_name} ON {table_name}';
                    EXECUTE 'ALTER TABLE {table_name} NO FORCE ROW LEVEL SECURITY';
                    EXECUTE 'ALTER TABLE {table_name} DISABLE ROW LEVEL SECURITY';
                END IF;
            END
            $$;
            """
        )

    op.execute("DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs")
    op.execute("ALTER TABLE audit_logs NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY")

    op.execute("DROP TRIGGER IF EXISTS trg_block_audit_log_update ON audit_logs")
    op.execute("DROP TRIGGER IF EXISTS trg_block_audit_log_delete ON audit_logs")
    op.execute("DROP FUNCTION IF EXISTS block_audit_log_mutation()")
