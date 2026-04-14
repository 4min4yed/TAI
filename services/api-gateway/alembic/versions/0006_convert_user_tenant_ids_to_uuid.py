"""Convert tenant/user identifiers to UUID strings.

Revision ID: 0006_uuid_user_tenant_ids
Revises: 6d4f12a0e9c1
Create Date: 2026-04-06
"""

from __future__ import annotations

import uuid

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0006_uuid_user_tenant_ids"
down_revision = "6d4f12a0e9c1"
branch_labels = None
depends_on = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return inspector.has_table(table_name)


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(c["name"] == column_name for c in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "tenants") or not _has_table(inspector, "users"):
        return

    # Add new UUID string columns used during data migration.
    if not _has_column(inspector, "tenants", "id_new"):
        op.add_column("tenants", sa.Column("id_new", sa.String(length=36), nullable=True))

    if not _has_column(inspector, "users", "id_new"):
        op.add_column("users", sa.Column("id_new", sa.String(length=36), nullable=True))
    if not _has_column(inspector, "users", "tenant_id_new"):
        op.add_column("users", sa.Column("tenant_id_new", sa.String(length=36), nullable=True))

    if _has_table(inspector, "email_verification_tokens") and not _has_column(inspector, "email_verification_tokens", "user_id_new"):
        op.add_column("email_verification_tokens", sa.Column("user_id_new", sa.String(length=36), nullable=True))

    tenant_map: dict[int, str] = {}
    for (old_tenant_id,) in bind.execute(sa.text("SELECT id FROM tenants")).fetchall():
        tenant_map[old_tenant_id] = str(uuid.uuid4())
        bind.execute(
            sa.text("UPDATE tenants SET id_new = :new_id WHERE id = :old_id"),
            {"new_id": tenant_map[old_tenant_id], "old_id": old_tenant_id},
        )

    user_map: dict[int, str] = {}
    for old_user_id, old_tenant_id in bind.execute(sa.text("SELECT id, tenant_id FROM users")).fetchall():
        user_map[old_user_id] = str(uuid.uuid4())
        bind.execute(
            sa.text(
                "UPDATE users "
                "SET id_new = :new_user_id, tenant_id_new = :new_tenant_id "
                "WHERE id = :old_user_id"
            ),
            {
                "new_user_id": user_map[old_user_id],
                "new_tenant_id": tenant_map.get(old_tenant_id),
                "old_user_id": old_user_id,
            },
        )

    if _has_table(inspector, "email_verification_tokens"):
        for old_user_id, new_user_id in user_map.items():
            bind.execute(
                sa.text(
                    "UPDATE email_verification_tokens "
                    "SET user_id_new = :new_user_id "
                    "WHERE CAST(user_id AS TEXT) = :old_user_id"
                ),
                {"new_user_id": new_user_id, "old_user_id": str(old_user_id)},
            )

    tenant_fk_tables = ["documents", "proposals", "compliance_reports", "company_assets"]
    for table_name in tenant_fk_tables:
        if not _has_table(inspector, table_name) or not _has_column(inspector, table_name, "tenant_id"):
            continue

        if not _has_column(inspector, table_name, "tenant_id_new"):
            op.add_column(table_name, sa.Column("tenant_id_new", sa.String(length=36), nullable=True))

        for old_tenant_id, new_tenant_id in tenant_map.items():
            bind.execute(
                sa.text(
                    f"UPDATE {table_name} "
                    "SET tenant_id_new = :new_tenant_id "
                    "WHERE CAST(tenant_id AS TEXT) = :old_tenant_id"
                ),
                {"new_tenant_id": new_tenant_id, "old_tenant_id": str(old_tenant_id)},
            )

    # Refresh inspector after schema mutations so subsequent checks see new columns.
    inspector = sa.inspect(bind)

    # Drop old FKs before swapping key columns.
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tenant_id_fkey")
    if _has_table(inspector, "email_verification_tokens"):
        op.execute("ALTER TABLE email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_user_id_fkey")

    # Swap tenant_id columns in dependent tables.
    for table_name in tenant_fk_tables:
        if not _has_table(inspector, table_name) or not _has_column(inspector, table_name, "tenant_id_new"):
            continue

        op.execute(f"ALTER TABLE {table_name} DROP COLUMN tenant_id")
        op.execute(f"ALTER TABLE {table_name} RENAME COLUMN tenant_id_new TO tenant_id")

    # Swap users table key columns.
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey")
    op.execute("ALTER TABLE users DROP COLUMN tenant_id")
    op.execute("ALTER TABLE users DROP COLUMN id")
    op.execute("ALTER TABLE users RENAME COLUMN id_new TO id")
    op.execute("ALTER TABLE users RENAME COLUMN tenant_id_new TO tenant_id")
    op.execute("ALTER TABLE users ALTER COLUMN id SET NOT NULL")
    op.execute("ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL")
    op.execute("ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)")

    # Swap tenants key column.
    op.execute("ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_pkey")
    op.execute("ALTER TABLE tenants DROP COLUMN id")
    op.execute("ALTER TABLE tenants RENAME COLUMN id_new TO id")
    op.execute("ALTER TABLE tenants ALTER COLUMN id SET NOT NULL")
    op.execute("ALTER TABLE tenants ADD CONSTRAINT tenants_pkey PRIMARY KEY (id)")

    # Recreate FK users -> tenants on UUID columns.
    op.create_foreign_key("users_tenant_id_fkey", "users", "tenants", ["tenant_id"], ["id"])

    # Swap token FK column and restore FK users -> email_verification_tokens.
    if _has_table(inspector, "email_verification_tokens") and _has_column(inspector, "email_verification_tokens", "user_id_new"):
        op.execute("ALTER TABLE email_verification_tokens DROP COLUMN user_id")
        op.execute("ALTER TABLE email_verification_tokens RENAME COLUMN user_id_new TO user_id")
        op.execute("ALTER TABLE email_verification_tokens ALTER COLUMN user_id SET NOT NULL")
        op.create_foreign_key(
            "email_verification_tokens_user_id_fkey",
            "email_verification_tokens",
            "users",
            ["user_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    raise NotImplementedError("Downgrade is not supported for UUID ID migration.")
