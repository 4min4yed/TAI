"""Add document metadata columns for MinIO-backed vault.

Revision ID: 0009_add_document_metadata_for_minio
Revises: 0008_enforce_documents_rls
Create Date: 2026-04-08
"""

from alembic import op
import sqlalchemy as sa


revision = "0009_add_document_metadata_for_minio"
down_revision = "0008_enforce_documents_rls"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("documents", sa.Column("doc_type", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("department", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("status", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("mime_type", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("size_bytes", sa.Integer(), nullable=True))
    op.add_column("documents", sa.Column("uploaded_by_user_id", sa.String(length=36), nullable=True))
    op.add_column("documents", sa.Column("tags", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("created_at_utc", sa.DateTime(timezone=True), nullable=True))
    op.add_column("documents", sa.Column("updated_at_utc", sa.DateTime(timezone=True), nullable=True))

    op.execute("UPDATE documents SET doc_type = 'General' WHERE doc_type IS NULL")
    op.execute("UPDATE documents SET department = 'General' WHERE department IS NULL")
    op.execute("UPDATE documents SET status = 'uploaded' WHERE status IS NULL")
    op.execute("UPDATE documents SET mime_type = 'application/octet-stream' WHERE mime_type IS NULL")
    op.execute("UPDATE documents SET size_bytes = 0 WHERE size_bytes IS NULL")
    op.execute("UPDATE documents SET tags = '' WHERE tags IS NULL")
    op.execute("UPDATE documents SET created_at_utc = CURRENT_TIMESTAMP WHERE created_at_utc IS NULL")
    op.execute("UPDATE documents SET updated_at_utc = CURRENT_TIMESTAMP WHERE updated_at_utc IS NULL")

    op.alter_column("documents", "doc_type", nullable=False)
    op.alter_column("documents", "department", nullable=False)
    op.alter_column("documents", "status", nullable=False)
    op.alter_column("documents", "mime_type", nullable=False)
    op.alter_column("documents", "size_bytes", nullable=False)
    op.alter_column("documents", "tags", nullable=False)
    op.alter_column("documents", "created_at_utc", nullable=False)
    op.alter_column("documents", "updated_at_utc", nullable=False)

    op.create_foreign_key(
        "documents_uploaded_by_user_id_fkey",
        "documents",
        "users",
        ["uploaded_by_user_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("documents_uploaded_by_user_id_fkey", "documents", type_="foreignkey")
    op.drop_column("documents", "updated_at_utc")
    op.drop_column("documents", "created_at_utc")
    op.drop_column("documents", "tags")
    op.drop_column("documents", "uploaded_by_user_id")
    op.drop_column("documents", "size_bytes")
    op.drop_column("documents", "mime_type")
    op.drop_column("documents", "status")
    op.drop_column("documents", "department")
    op.drop_column("documents", "doc_type")
