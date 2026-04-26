"""add_login_email_codes

Revision ID: 0014_add_login_email_codes
Revises: 0013_security_hardening_rls_extensions
Create Date: 2026-04-17
"""

from alembic import op
import sqlalchemy as sa


revision = "0014_add_login_email_codes"
down_revision = "0013_security_hardening_rls_extensions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "login_email_codes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("challenge_jti", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("failed_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("is_used", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("invalidated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("invalidation_reason", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("challenge_jti", name="uq_login_email_codes_challenge_jti"),
    )
    op.create_index("ix_login_email_codes_user_id", "login_email_codes", ["user_id"], unique=False)
    op.create_index("ix_login_email_codes_email", "login_email_codes", ["email"], unique=False)
    op.create_index("ix_login_email_codes_challenge_jti", "login_email_codes", ["challenge_jti"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_login_email_codes_challenge_jti", table_name="login_email_codes")
    op.drop_index("ix_login_email_codes_email", table_name="login_email_codes")
    op.drop_index("ix_login_email_codes_user_id", table_name="login_email_codes")
    op.drop_table("login_email_codes")
