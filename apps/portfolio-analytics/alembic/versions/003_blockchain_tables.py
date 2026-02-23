"""Blockchain simulation tables (block, chain_transaction, wallet_balance)

Revision ID: 003
Revises: 002
Create Date: 2025-02-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "block",
        sa.Column("block_index", sa.Integer(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("previous_hash", sa.Text(), nullable=False),
        sa.Column("hash", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("block_index"),
    )
    op.create_table(
        "chain_transaction",
        sa.Column("tx_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("block_index", sa.Integer(), nullable=False),
        sa.Column("sender_account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("receiver_account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(20, 8), nullable=False),
        sa.Column("currency", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("tx_id"),
        sa.ForeignKeyConstraint(["block_index"], ["block.block_index"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_account_id"], ["account.account_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["receiver_account_id"], ["account.account_id"], ondelete="CASCADE"),
    )
    op.create_index("idx_chain_transaction_block", "chain_transaction", ["block_index"])
    op.create_table(
        "wallet_balance",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("currency", sa.Text(), nullable=False),
        sa.Column("balance", sa.Numeric(20, 8), nullable=False, server_default=sa.text("0")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("account_id", "currency"),
        sa.ForeignKeyConstraint(["account_id"], ["account.account_id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("wallet_balance")
    op.drop_index("idx_chain_transaction_block", table_name="chain_transaction")
    op.drop_table("chain_transaction")
    op.drop_table("block")
