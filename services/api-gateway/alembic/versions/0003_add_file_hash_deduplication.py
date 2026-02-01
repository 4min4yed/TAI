"""Add file hash column for deduplication

Revision ID: 0003_add_file_hash_deduplication
Revises: 0002_add_auth_security_tables
"""
from alembic import op
import sqlalchemy as sa

revision = '0003_add_file_hash_deduplication'
down_revision = '0002_add_auth_security_tables'


def upgrade():
    op.add_column('documents', sa.Column('sha256', sa.String(length=64), nullable=True))


def downgrade():
    op.drop_column('documents', 'sha256')
