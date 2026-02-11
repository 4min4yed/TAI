"""Add file hash column for deduplication

Revision ID: 0003_add_file_hash_deduplication
Revises: 0002_add_auth_security_tables
"""
from alembic import op
import sqlalchemy as sa

revision = '0003_add_file_hash_deduplication'
down_revision = '0002_add_auth_security_tables'


def upgrade():
    # Create documents table if it doesn't exist, then add column
    op.create_table('documents', 
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('tenant_id', sa.Integer, nullable=False),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('sha256', sa.String(length=64), nullable=True)
    )


def downgrade():
    op.drop_column('documents', 'sha256')
