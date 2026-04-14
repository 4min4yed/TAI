"""Add filename/path columns to documents for vault API compatibility.

Revision ID: 0010_add_documents_filename_path
Revises: 0009_add_document_metadata_for_minio
Create Date: 2026-04-08
"""

from alembic import op
import sqlalchemy as sa


revision = "0010_add_documents_filename_path"
down_revision = "0009_add_document_metadata_for_minio"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("documents", sa.Column("filename", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("path", sa.String(), nullable=True))

    # Backfill from legacy columns to keep existing rows readable.
    op.execute("UPDATE documents SET filename = COALESCE(name, 'document.bin') WHERE filename IS NULL")
    op.execute("UPDATE documents SET path = COALESCE(sha256, '') WHERE path IS NULL")

    op.alter_column("documents", "filename", nullable=False)
    op.alter_column("documents", "path", nullable=False)


def downgrade() -> None:
    op.drop_column("documents", "path")
    op.drop_column("documents", "filename")
