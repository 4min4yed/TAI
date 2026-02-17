"""fix_user_null_constraints

Revision ID: 0112867f060a
Revises: 37996833e8eb
Create Date: 2026-02-17 21:31:40.185452

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0112867f060a'
down_revision = '37996833e8eb'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Fill existing NULLs with 'false' so we don't error out when adding NOT NULL
    op.execute("UPDATE users SET is_verified = false WHERE is_verified IS NULL")
    op.execute("UPDATE users SET is_2fa_enabled = false WHERE is_2fa_enabled IS NULL")
    op.execute("UPDATE users SET first_name = '' WHERE first_name IS NULL")
    op.execute("UPDATE users SET last_name = '' WHERE last_name IS NULL")

    # 2. Alter columns to be NOT NULL and set the proper server default
    op.alter_column('users', 'is_verified',
               existing_type=sa.Boolean(),
               nullable=False,
               server_default=sa.text('false'))
    
    op.alter_column('users', 'is_2fa_enabled',
               existing_type=sa.Boolean(),
               nullable=False,
               server_default=sa.text('false'))

    op.alter_column('users', 'first_name',
               existing_type=sa.String(),
               nullable=False,
               server_default='')

    op.alter_column('users', 'last_name',
               existing_type=sa.String(),
               nullable=False,
               server_default='')

def downgrade():
    # To roll back, we just allow nulls again
    op.alter_column('users', 'is_2fa_enabled', nullable=True)
    op.alter_column('users', 'is_verified', nullable=True)
    op.alter_column('users', 'last_name', nullable=True)
    op.alter_column('users', 'first_name', nullable=True)