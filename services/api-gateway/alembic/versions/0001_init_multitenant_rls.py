"""Initial schema and RLS policies (stub).

Revision ID: 0001_init_multitenant_rls
Revises: 
Create Date: 2026-01-30
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_init_multitenant_rls'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Example: create tenants table and enable RLS in Postgres
    op.create_table('tenants', sa.Column('id', sa.Integer, primary_key=True), sa.Column('name', sa.String, nullable=False))
    # RLS creation requires raw SQL in migrations
    op.execute("-- Add RLS policies for tenant isolation here")


def downgrade():
    op.drop_table('tenants')
