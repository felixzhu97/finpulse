package crypto

import (
	"testing"
	"time"
)

func TestComputeBlockHash(t *testing.T) {
	t.Run("computes consistent hash for same inputs", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)
		txIDs := []string{"tx1", "tx2"}

		hash1 := ComputeBlockHash(0, timestamp, "0", txIDs)
		hash2 := ComputeBlockHash(0, timestamp, "0", txIDs)

		if hash1 != hash2 {
			t.Errorf("Hash should be consistent: %v != %v", hash1, hash2)
		}
	})

	t.Run("produces different hash for different index", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)
		txIDs := []string{"tx1"}

		hash1 := ComputeBlockHash(0, timestamp, "0", txIDs)
		hash2 := ComputeBlockHash(1, timestamp, "0", txIDs)

		if hash1 == hash2 {
			t.Error("Different index should produce different hash")
		}
	})

	t.Run("produces different hash for different timestamp", func(t *testing.T) {
		t1 := time.Unix(1000000000, 0)
		t2 := time.Unix(2000000000, 0)
		txIDs := []string{"tx1"}

		hash1 := ComputeBlockHash(0, t1, "0", txIDs)
		hash2 := ComputeBlockHash(0, t2, "0", txIDs)

		if hash1 == hash2 {
			t.Error("Different timestamp should produce different hash")
		}
	})

	t.Run("produces different hash for different previous hash", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)
		txIDs := []string{"tx1"}

		hash1 := ComputeBlockHash(0, timestamp, "0", txIDs)
		hash2 := ComputeBlockHash(0, timestamp, "different", txIDs)

		if hash1 == hash2 {
			t.Error("Different previous hash should produce different hash")
		}
	})

	t.Run("produces different hash for different transactions", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)

		hash1 := ComputeBlockHash(0, timestamp, "0", []string{"tx1"})
		hash2 := ComputeBlockHash(0, timestamp, "0", []string{"tx1", "tx2"})

		if hash1 == hash2 {
			t.Error("Different transactions should produce different hash")
		}
	})

	t.Run("produces hash of correct length", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)
		hash := ComputeBlockHash(0, timestamp, "0", []string{"tx1"})

		if len(hash) != 64 {
			t.Errorf("SHA256 hash should be 64 hex characters, got %d", len(hash))
		}
	})

	t.Run("handles empty transaction list", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)
		hash := ComputeBlockHash(0, timestamp, "0", []string{})

		if hash == "" {
			t.Error("Hash should not be empty")
		}
	})

	t.Run("handles many transactions", func(t *testing.T) {
		timestamp := time.Unix(1234567890, 0)
		txIDs := []string{}
		for i := 0; i < 100; i++ {
			txIDs = append(txIDs, "transaction-"+string(rune('a'+i%26)))
		}
		hash := ComputeBlockHash(0, timestamp, "0", txIDs)

		if hash == "" {
			t.Error("Hash should not be empty")
		}
	})
}
