"""Add role column to users table

Revision ID: 0005_add_user_role_column
Revises: 0004_add_company_asset_table
"""
from alembic import op
import sqlalchemy as sa

revision = '0005_add_user_role_column'
down_revision = '0004_add_company_asset_table'


def upgrade():
    # add role column with default 'user' for existing and new rows
    op.add_column('users', sa.Column('role', sa.String(), nullable=False, server_default='user'))
    # remove server default for future inserts if desired (optional)
    with op.get_context().autocommit_block():
        op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")


def downgrade():
    op.drop_column('users', 'role')
