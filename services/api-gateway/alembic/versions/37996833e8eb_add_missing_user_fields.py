"""add_missing_user_fields

Revision ID: 37996833e8eb
Revises: 0005_add_user_role_column
Create Date: 2026-02-13 21:24:28.456278

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '37996833e8eb'
down_revision = '0005_add_user_role_column'
branch_labels = None
depends_on = None


def upgrade():
    # Adds the missing columns to the 'users' table in PostgreSQL
    op.add_column('users', sa.Column('first_name', sa.String(), nullable=False, server_default=''))
    op.add_column('users', sa.Column('last_name', sa.String(), nullable=False, server_default=''))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), server_default='false'))
    op.add_column('users', sa.Column('is_2fa_enabled', sa.Boolean(), server_default='false'))

def downgrade():
    # Removes the columns if you ever need to roll back
    op.drop_column('users', 'is_2fa_enabled')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')