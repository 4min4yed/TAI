"""Company asset table for logos and templates

Revision ID: 0004_add_company_asset_table
Revises: 0003_add_file_hash_deduplication
"""
from alembic import op
import sqlalchemy as sa

revision = '0004_add_company_asset_table'
down_revision = '0003_add_file_hash_deduplication'


def upgrade():
    op.create_table('company_assets', sa.Column('id', sa.String, primary_key=True), sa.Column('tenant_id', sa.String), sa.Column('asset_type', sa.String), sa.Column('path', sa.String))


def downgrade():
    op.drop_table('company_assets')
