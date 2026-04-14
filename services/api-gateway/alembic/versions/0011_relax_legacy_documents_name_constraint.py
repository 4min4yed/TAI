"""Relax legacy documents.name NOT NULL constraint.

Revision ID: 0011_relax_legacy_documents_name_constraint
Revises: 0010_add_documents_filename_path
Create Date: 2026-04-08
"""

from alembic import op


revision = "0011_relax_legacy_documents_name_constraint"
down_revision = "0010_add_documents_filename_path"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE documents ALTER COLUMN name DROP NOT NULL")


def downgrade() -> None:
    op.execute("UPDATE documents SET name = filename WHERE name IS NULL")
    op.execute("ALTER TABLE documents ALTER COLUMN name SET NOT NULL")
