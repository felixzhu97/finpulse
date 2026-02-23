"""Auth tables: user_credential, session

Revision ID: 007
Revises: 006
Create Date: 2025-02-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_credential",
        sa.Column("credential_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("credential_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("email", name="uq_user_credential_email"),
    )
    op.create_index("idx_user_credential_email", "user_credential", ["email"])
    op.create_index("idx_user_credential_customer", "user_credential", ["customer_id"])

    op.create_table(
        "session",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("session_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customer.customer_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("token", name="uq_session_token"),
    )
    op.create_index("idx_session_token", "session", ["token"])
    op.create_index("idx_session_expires_at", "session", ["expires_at"])


def downgrade() -> None:
    op.drop_index("idx_session_expires_at", table_name="session")
    op.drop_index("idx_session_token", table_name="session")
    op.drop_table("session")
    op.drop_index("idx_user_credential_customer", table_name="user_credential")
    op.drop_index("idx_user_credential_email", table_name="user_credential")
    op.drop_table("user_credential")
