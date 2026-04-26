"""add_login_mfa_enabled_flag

Revision ID: 0015_add_login_mfa_enabled_flag
Revises: 0014_add_login_email_codes
Create Date: 2026-04-26
"""

from alembic import op
import sqlalchemy as sa


revision = "0015_add_login_mfa_enabled_flag"
down_revision = "0014_add_login_email_codes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "login_mfa_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "login_mfa_enabled")
