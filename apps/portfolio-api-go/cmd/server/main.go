package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	_ "finpulse/portfolio-api-go/docs"
	"finpulse/portfolio-api-go/internal/application"
	"finpulse/portfolio-api-go/internal/config"
	"finpulse/portfolio-api-go/internal/handler"
	"finpulse/portfolio-api-go/internal/infrastructure/persistence"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}
	quoteRepo := persistence.NewQuoteRepo(pool)
	instrumentRepo := persistence.NewInstrumentRepo(pool)
	authRepo := persistence.NewAuthRepo(pool)
	customerRepo := persistence.NewCustomerRepo(pool)
	authSvc := application.NewAuthService(authRepo, customerRepo)
	h := &handler.Handler{
		QuotesSvc:      application.NewQuotesService(quoteRepo),
		InstrumentsSvc: application.NewInstrumentsService(instrumentRepo),
		AuthSvc:        authSvc,
	}
	r := gin.New()
	r.Use(gin.Recovery(), cors())
	r.GET("/health", h.Health)
	r.GET("/api/v1/quotes", h.Quotes)
	r.GET("/api/v1/instruments", h.Instruments)
	r.POST("/api/v1/auth/login", h.AuthLogin)
	r.POST("/api/v1/auth/register", h.AuthRegister)
	r.GET("/api/v1/auth/me", h.AuthMe)
	r.POST("/api/v1/auth/logout", h.AuthLogout)
	r.POST("/api/v1/auth/change-password", h.AuthChangePassword)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// Proxy any other path to Python backend (portfolio, customers, accounts, etc.)
	r.NoRoute(handler.ProxyToPython(cfg.PythonBackendURL))
	srv := &http.Server{Addr: ":" + cfg.Port, Handler: r}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()
	log.Printf("portfolio-api-go listening on :%s", cfg.Port)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	if err := srv.Shutdown(context.Background()); err != nil {
		log.Print(err)
	}
}

func cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "*")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
