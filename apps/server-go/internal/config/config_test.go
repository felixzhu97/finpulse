package config

import (
	"os"
	"testing"
)

func TestGetEnv(t *testing.T) {
	t.Run("returns environment value", func(t *testing.T) {
		os.Setenv("TEST_KEY", "test-value")
		defer os.Unsetenv("TEST_KEY")

		result := getEnv("TEST_KEY", "fallback")
		if result != "test-value" {
			t.Errorf("getEnv() = %q; want test-value", result)
		}
	})

	t.Run("returns fallback when not set", func(t *testing.T) {
		os.Unsetenv("UNSET_KEY")
		result := getEnv("UNSET_KEY", "fallback-value")
		if result != "fallback-value" {
			t.Errorf("getEnv() = %q; want fallback-value", result)
		}
	})

	t.Run("returns fallback when empty", func(t *testing.T) {
		os.Setenv("EMPTY_KEY", "")
		defer os.Unsetenv("EMPTY_KEY")

		result := getEnv("EMPTY_KEY", "fallback")
		if result != "fallback" {
			t.Errorf("getEnv() = %q; want fallback", result)
		}
	})
}

func TestLoad(t *testing.T) {
	t.Run("loads with default values", func(t *testing.T) {
		// Unset all relevant env vars
		envVars := []string{"DATABASE_URL", "PORT", "PYTHON_BACKEND_URL", "PYTHON_ANALYTICS_URL", "REDIS_URL"}
		for _, v := range envVars {
			os.Unsetenv(v)
		}

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v; want nil", err)
		}

		if cfg.DatabaseURL != "postgresql://postgres:postgres@127.0.0.1:5433/portfolio" {
			t.Errorf("DatabaseURL = %q; want default", cfg.DatabaseURL)
		}
		if cfg.Port != "8801" {
			t.Errorf("Port = %q; want 8801", cfg.Port)
		}
		if cfg.PythonBackendURL != "http://127.0.0.1:8800" {
			t.Errorf("PythonBackendURL = %q; want default", cfg.PythonBackendURL)
		}
	})

	t.Run("loads with custom values", func(t *testing.T) {
		os.Setenv("DATABASE_URL", "postgresql://custom:pass@host:5432/db")
		os.Setenv("PORT", "9090")
		os.Setenv("PYTHON_BACKEND_URL", "http://custom:8080")
		os.Setenv("PYTHON_ANALYTICS_URL", "http://analytics:8080")
		os.Setenv("REDIS_URL", "redis://custom:6379/1")
		defer func() {
			os.Unsetenv("DATABASE_URL")
			os.Unsetenv("PORT")
			os.Unsetenv("PYTHON_BACKEND_URL")
			os.Unsetenv("PYTHON_ANALYTICS_URL")
			os.Unsetenv("REDIS_URL")
		}()

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v; want nil", err)
		}

		if cfg.DatabaseURL != "postgresql://custom:pass@host:5432/db" {
			t.Errorf("DatabaseURL = %q; want custom", cfg.DatabaseURL)
		}
		if cfg.Port != "9090" {
			t.Errorf("Port = %q; want 9090", cfg.Port)
		}
		if cfg.PythonAnalyticsURL != "http://analytics:8080" {
			t.Errorf("PythonAnalyticsURL = %q; want custom analytics", cfg.PythonAnalyticsURL)
		}
		if cfg.RedisURL != "redis://custom:6379/1" {
			t.Errorf("RedisURL = %q; want custom", cfg.RedisURL)
		}
	})
}
