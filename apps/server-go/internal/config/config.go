package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL        string
	Port               string
	PythonBackendURL   string
	PythonAnalyticsURL string
	RedisURL           string
}

func Load() (*Config, error) {
	_ = godotenv.Load()
	pyURL := getEnv("PYTHON_BACKEND_URL", "http://127.0.0.1:8800")
	c := &Config{
		DatabaseURL:        getEnv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5433/portfolio"),
		Port:               getEnv("PORT", "8801"),
		PythonBackendURL:   pyURL,
		PythonAnalyticsURL: getEnv("PYTHON_ANALYTICS_URL", pyURL),
		RedisURL:           getEnv("REDIS_URL", "redis://127.0.0.1:6379/0"),
	}
	return c, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
