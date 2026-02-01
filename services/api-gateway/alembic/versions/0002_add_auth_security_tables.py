"""Add authentication & security tables (users, sessions, api_keys)

Revision ID: 0002_add_auth_security_tables
Revises: 0001_init_multitenant_rls
"""
from alembic import op
import sqlalchemy as sa

revision = '0002_add_auth_security_tables'
down_revision = '0001_init_multitenant_rls'


def upgrade():
    op.create_table('users', sa.Column('id', sa.Integer, primary_key=True), sa.Column('email', sa.String, nullable=False))
    op.create_table('api_keys', sa.Column('id', sa.Integer, primary_key=True), sa.Column('key_hash', sa.String, nullable=False))


def downgrade():
    op.drop_table('api_keys')
    op.drop_table('users')
