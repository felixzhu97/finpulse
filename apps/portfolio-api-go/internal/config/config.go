package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
}

func Load() (*Config, error) {
	_ = godotenv.Load()
	c := &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5433/portfolio"),
		Port:        getEnv("PORT", "8801"),
	}
	return c, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
