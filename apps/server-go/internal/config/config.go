package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL      string
	Port             string
	PythonBackendURL string // e.g. http://127.0.0.1:8800 for proxying unimplemented routes
}

func Load() (*Config, error) {
	_ = godotenv.Load()
	c := &Config{
		DatabaseURL:      getEnv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5433/portfolio"),
		Port:             getEnv("PORT", "8801"),
		PythonBackendURL: getEnv("PYTHON_BACKEND_URL", "http://127.0.0.1:8800"),
	}
	return c, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
