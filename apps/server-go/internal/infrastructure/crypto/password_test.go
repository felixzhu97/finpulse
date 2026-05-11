package crypto

import (
	"testing"
)

func TestBcryptPasswordHasher(t *testing.T) {
	t.Run("Hash returns hash", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()

		hash, err := hasher.Hash("password123")

		if err != nil {
			t.Fatalf("Hash() error = %v; want nil", err)
		}
		if hash == "" {
			t.Error("Hash() returned empty string")
		}
		if hash == "password123" {
			t.Error("Hash() returned plaintext password")
		}
	})

	t.Run("Hash generates unique hashes", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()

		hash1, _ := hasher.Hash("password")
		hash2, _ := hasher.Hash("password")

		if hash1 == hash2 {
			t.Error("Hash() should generate unique hashes for same password")
		}
	})

	t.Run("Verify returns true for correct password", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()
		hash, _ := hasher.Hash("password123")

		result := hasher.Verify("password123", hash)

		if !result {
			t.Error("Verify() = false; want true for correct password")
		}
	})

	t.Run("Verify returns false for incorrect password", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()
		hash, _ := hasher.Hash("correctpassword")

		result := hasher.Verify("wrongpassword", hash)

		if result {
			t.Error("Verify() = true; want false for incorrect password")
		}
	})

	t.Run("Verify returns false for empty password", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()
		hash, _ := hasher.Hash("password")

		result := hasher.Verify("", hash)

		if result {
			t.Error("Verify() = true; want false for empty password")
		}
	})

	t.Run("Verify returns false for empty hash", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()

		result := hasher.Verify("password", "")

		if result {
			t.Error("Verify() = true; want false for empty hash")
		}
	})

	t.Run("Verify returns false for invalid hash format", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()

		result := hasher.Verify("password", "invalid-hash-format")

		if result {
			t.Error("Verify() = true; want false for invalid hash")
		}
	})

	t.Run("works with various password lengths", func(t *testing.T) {
		hasher := NewBcryptPasswordHasher()
		passwords := []string{"", "a", "short", "medium length password", "very long password with special chars !@#$%^&*()"}

		for _, pwd := range passwords {
			hash, err := hasher.Hash(pwd)
			if err != nil {
				t.Errorf("Hash(%q) error = %v; want nil", pwd, err)
			}
			if !hasher.Verify(pwd, hash) {
				t.Errorf("Verify(%q, hash) = false; want true", pwd)
			}
		}
	})
}
