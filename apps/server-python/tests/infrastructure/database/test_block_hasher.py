from datetime import datetime, timezone

import pytest

from src.infrastructure.database.block_hasher import (
    BlockHashPayload,
    compute_block_hash,
)


class TestBlockHashPayload:
    """Tests for the BlockHashPayload model."""

    def test_block_hash_payload_creation(self) -> None:
        """Test creating a BlockHashPayload instance."""
        payload = BlockHashPayload(
            index=1,
            timestamp="2024-01-01T00:00:00",
            previous_hash="0" * 64,
            transaction_ids=["tx1", "tx2"],
        )
        assert payload.index == 1
        assert payload.timestamp == "2024-01-01T00:00:00"
        assert payload.previous_hash == "0" * 64
        assert payload.transaction_ids == ["tx1", "tx2"]

    def test_block_hash_payload_is_frozen(self) -> None:
        """Test that BlockHashPayload is a frozen model."""
        payload = BlockHashPayload(
            index=1,
            timestamp="2024-01-01T00:00:00",
            previous_hash="0" * 64,
            transaction_ids=[],
        )
        with pytest.raises(Exception):  # Pydantic raises ValidationError for frozen models
            payload.index = 2


class TestComputeBlockHash:
    """Tests for the compute_block_hash function."""

    def test_compute_block_hash_returns_hex_string(self) -> None:
        """Test that compute_block_hash returns a hex string of correct length."""
        result = compute_block_hash(
            index=0,
            timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
            previous_hash="0" * 64,
            transaction_ids=(),
        )
        # SHA256 produces 64 hex characters
        assert len(result) == 64
        assert all(c in "0123456789abcdef" for c in result)

    def test_compute_block_hash_deterministic(self) -> None:
        """Test that compute_block_hash produces consistent results for same input."""
        timestamp = datetime(2024, 1, 1, tzinfo=timezone.utc)
        result1 = compute_block_hash(1, timestamp, "0" * 64, ("tx1", "tx2"))
        result2 = compute_block_hash(1, timestamp, "0" * 64, ("tx1", "tx2"))
        assert result1 == result2

    def test_compute_block_hash_different_index_different_hash(self) -> None:
        """Test that different indices produce different hashes."""
        timestamp = datetime(2024, 1, 1, tzinfo=timezone.utc)
        hash1 = compute_block_hash(0, timestamp, "0" * 64, ())
        hash2 = compute_block_hash(1, timestamp, "0" * 64, ())
        assert hash1 != hash2

    def test_compute_block_hash_different_timestamp_different_hash(self) -> None:
        """Test that different timestamps produce different hashes."""
        timestamp1 = datetime(2024, 1, 1, tzinfo=timezone.utc)
        timestamp2 = datetime(2024, 1, 2, tzinfo=timezone.utc)
        hash1 = compute_block_hash(0, timestamp1, "0" * 64, ())
        hash2 = compute_block_hash(0, timestamp2, "0" * 64, ())
        assert hash1 != hash2

    def test_compute_block_hash_different_previous_hash_different_hash(self) -> None:
        """Test that different previous hashes produce different hashes."""
        timestamp = datetime(2024, 1, 1, tzinfo=timezone.utc)
        hash1 = compute_block_hash(1, timestamp, "a" * 64, ())
        hash2 = compute_block_hash(1, timestamp, "b" * 64, ())
        assert hash1 != hash2

    def test_compute_block_hash_different_transactions_different_hash(self) -> None:
        """Test that different transactions produce different hashes."""
        timestamp = datetime(2024, 1, 1, tzinfo=timezone.utc)
        hash1 = compute_block_hash(1, timestamp, "0" * 64, ("tx1",))
        hash2 = compute_block_hash(1, timestamp, "0" * 64, ("tx2",))
        assert hash1 != hash2

    def test_compute_block_hash_empty_transactions(self) -> None:
        """Test compute_block_hash with empty transaction list."""
        result = compute_block_hash(
            index=0,
            timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
            previous_hash="0" * 64,
            transaction_ids=(),
        )
        assert len(result) == 64

    def test_compute_block_hash_many_transactions(self) -> None:
        """Test compute_block_hash with many transactions."""
        transactions = tuple(f"tx{i}" for i in range(100))
        result = compute_block_hash(
            index=5,
            timestamp=datetime(2024, 6, 15, tzinfo=timezone.utc),
            previous_hash="abcd" * 16,
            transaction_ids=transactions,
        )
        assert len(result) == 64
