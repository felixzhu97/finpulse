package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	_ "finpulse/server-go/docs"
	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/config"
	"finpulse/server-go/internal/handler"
	"finpulse/server-go/internal/infrastructure/cache"
	"finpulse/server-go/internal/infrastructure/persistence"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
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
	blockchainLedger := persistence.NewBlockchainLedgerRepo(pool)
	walletRepo := persistence.NewWalletBalanceRepo(pool)
	blockchainSvc := application.NewBlockchainService(pool, blockchainLedger, walletRepo)
	var cacheInstance handler.Cache
	if cfg.RedisURL != "" {
		if opts, err := redis.ParseURL(cfg.RedisURL); err == nil {
			redisClient := redis.NewClient(opts)
			if err := redisClient.Ping(context.Background()).Err(); err == nil {
				cacheInstance = cache.NewRedisCache(redisClient)
			}
		}
	}
	accountRepo := persistence.NewAccountRepo(pool)
	watchlistRepo := persistence.NewWatchlistRepo(pool)
	watchlistItemRepo := persistence.NewWatchlistItemRepo(pool)
	h := &handler.Handler{
		QuotesSvc:         application.NewQuotesService(quoteRepo),
		InstrumentsSvc:    application.NewInstrumentsService(instrumentRepo),
		AuthSvc:           authSvc,
		BlockchainSvc:     blockchainSvc,
		CustomerRepo:      customerRepo,
		AccountRepo:       accountRepo,
		WatchlistRepo:     watchlistRepo,
		WatchlistItemRepo: watchlistItemRepo,
		Cache:             cacheInstance,
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
	r.POST("/api/v1/blockchain/seed-balance", h.BlockchainSeedBalance)
	r.GET("/api/v1/blockchain/blocks", h.BlockchainListBlocks)
	r.GET("/api/v1/blockchain/blocks/:block_index", h.BlockchainGetBlock)
	r.POST("/api/v1/blockchain/transfers", h.BlockchainTransfer)
	r.GET("/api/v1/blockchain/transactions/:tx_id", h.BlockchainGetTransaction)
	r.GET("/api/v1/blockchain/balances", h.BlockchainGetBalance)
	r.GET("/api/v1/customers", h.CustomersList)
	r.GET("/api/v1/customers/:customer_id", h.CustomersGet)
	r.POST("/api/v1/customers", h.CustomersCreate)
	r.POST("/api/v1/customers/batch", h.CustomersCreateBatch)
	r.PUT("/api/v1/customers/:customer_id", h.CustomersUpdate)
	r.DELETE("/api/v1/customers/:customer_id", h.CustomersDelete)
	r.GET("/api/v1/accounts", h.AccountsList)
	r.GET("/api/v1/accounts/:account_id", h.AccountsGet)
	r.POST("/api/v1/accounts", h.AccountsCreate)
	r.POST("/api/v1/accounts/batch", h.AccountsCreateBatch)
	r.PUT("/api/v1/accounts/:account_id", h.AccountsUpdate)
	r.DELETE("/api/v1/accounts/:account_id", h.AccountsDelete)
	r.GET("/api/v1/watchlists", h.WatchlistsList)
	r.GET("/api/v1/watchlists/:watchlist_id", h.WatchlistsGet)
	r.POST("/api/v1/watchlists", h.WatchlistsCreate)
	r.POST("/api/v1/watchlists/batch", h.WatchlistsCreateBatch)
	r.PUT("/api/v1/watchlists/:watchlist_id", h.WatchlistsUpdate)
	r.DELETE("/api/v1/watchlists/:watchlist_id", h.WatchlistsDelete)
	r.GET("/api/v1/watchlist-items", h.WatchlistItemsList)
	r.GET("/api/v1/watchlist-items/:watchlist_item_id", h.WatchlistItemsGet)
	r.POST("/api/v1/watchlist-items", h.WatchlistItemsCreate)
	r.POST("/api/v1/watchlist-items/batch", h.WatchlistItemsCreateBatch)
	r.PUT("/api/v1/watchlist-items/:watchlist_item_id", h.WatchlistItemsUpdate)
	r.DELETE("/api/v1/watchlist-items/:watchlist_item_id", h.WatchlistItemsDelete)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.NoRoute(handler.ProxyAnalyticsOnly(cfg.PythonAnalyticsURL, cfg.PythonBackendURL))
	srv := &http.Server{Addr: ":" + cfg.Port, Handler: r}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()
	log.Printf("server-go listening on :%s", cfg.Port)
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
