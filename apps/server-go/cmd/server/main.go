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
	"finpulse/server-go/internal/infrastructure/crypto"
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
	bondRepo := persistence.NewBondRepo(pool)
	optionRepo := persistence.NewOptionRepo(pool)
	authRepo := persistence.NewAuthRepo(pool)
	customerRepo := persistence.NewCustomerRepo(pool)
	passwordHasher := crypto.NewBcryptPasswordHasher()
	authSvc := application.NewAuthService(authRepo, customerRepo, passwordHasher)
	txMgr := persistence.NewPgxTxManager(pool)
	blockchainLedger := persistence.NewBlockchainLedgerRepo(pool)
	walletRepo := persistence.NewWalletBalanceRepo(pool)
	blockchainSvc := application.NewBlockchainService(txMgr, blockchainLedger, walletRepo)
	var cacheInstance application.Cache
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
	userPreferenceRepo := persistence.NewUserPreferenceRepo(pool)
	portfolioRepo := persistence.NewPortfolioRepo(pool)
	positionRepo := persistence.NewPositionRepo(pool)
	orderRepo := persistence.NewOrderRepo(pool)
	tradeRepo := persistence.NewTradeRepo(pool)
	cashTransactionRepo := persistence.NewCashTransactionRepo(pool)
	paymentRepo := persistence.NewPaymentRepo(pool)
	settlementRepo := persistence.NewSettlementRepo(pool)
	marketDataRepo := persistence.NewMarketDataRepo(pool)
	customerSvc := application.NewCustomerService(customerRepo)
	accountSvc := application.NewAccountService(accountRepo)
	bondSvc := application.NewBondService(bondRepo)
	optionSvc := application.NewOptionService(optionRepo)
	watchlistSvc := application.NewWatchlistService(watchlistRepo)
	watchlistItemSvc := application.NewWatchlistItemService(watchlistItemRepo)
	userPreferenceSvc := application.NewUserPreferenceService(userPreferenceRepo)
	portfolioSvc := application.NewPortfolioService(portfolioRepo)
	positionSvc := application.NewPositionService(positionRepo)
	orderSvc := application.NewOrderService(orderRepo)
	tradeSvc := application.NewTradeService(tradeRepo)
	cashTransactionSvc := application.NewCashTransactionService(cashTransactionRepo)
	paymentSvc := application.NewPaymentService(paymentRepo)
	settlementSvc := application.NewSettlementService(settlementRepo)
	marketDataSvc := application.NewMarketDataService(marketDataRepo)
	h := &handler.Handler{
		QuotesSvc:            application.NewQuotesService(quoteRepo),
		InstrumentsSvc:       application.NewInstrumentsService(instrumentRepo),
		AuthSvc:              authSvc,
		BlockchainSvc:        blockchainSvc,
		CustomerSvc:          customerSvc,
		AccountSvc:           accountSvc,
		BondSvc:              bondSvc,
		OptionSvc:            optionSvc,
		WatchlistSvc:         watchlistSvc,
		WatchlistItemSvc:     watchlistItemSvc,
		UserPreferenceSvc:    userPreferenceSvc,
		PortfolioSvc:         portfolioSvc,
		PositionSvc:          positionSvc,
		OrderSvc:             orderSvc,
		TradeSvc:             tradeSvc,
		CashTransactionSvc:   cashTransactionSvc,
		PaymentSvc:           paymentSvc,
		SettlementSvc:        settlementSvc,
		MarketDataSvc:        marketDataSvc,
		Cache:                cacheInstance,
	}
	r := gin.New()
	r.Use(gin.Recovery(), cors())
	r.GET("/health", h.Health)
	r.GET("/api/v1/quotes", h.Quotes)
	r.GET("/api/v1/instruments", h.InstrumentsList)
	r.GET("/api/v1/instruments/:instrument_id", h.InstrumentsGet)
	r.POST("/api/v1/instruments", h.InstrumentsCreate)
	r.POST("/api/v1/instruments/batch", h.InstrumentsCreateBatch)
	r.PUT("/api/v1/instruments/:instrument_id", h.InstrumentsUpdate)
	r.DELETE("/api/v1/instruments/:instrument_id", h.InstrumentsDelete)
	r.GET("/api/v1/bonds", h.BondsList)
	r.GET("/api/v1/bonds/:bond_id", h.BondsGet)
	r.POST("/api/v1/bonds", h.BondsCreate)
	r.POST("/api/v1/bonds/batch", h.BondsCreateBatch)
	r.PUT("/api/v1/bonds/:bond_id", h.BondsUpdate)
	r.DELETE("/api/v1/bonds/:bond_id", h.BondsDelete)
	r.GET("/api/v1/options", h.OptionsList)
	r.GET("/api/v1/options/:option_id", h.OptionsGet)
	r.POST("/api/v1/options", h.OptionsCreate)
	r.POST("/api/v1/options/batch", h.OptionsCreateBatch)
	r.PUT("/api/v1/options/:option_id", h.OptionsUpdate)
	r.DELETE("/api/v1/options/:option_id", h.OptionsDelete)
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
	r.GET("/api/v1/user-preferences", h.UserPreferencesList)
	r.GET("/api/v1/user-preferences/:preference_id", h.UserPreferencesGet)
	r.POST("/api/v1/user-preferences", h.UserPreferencesCreate)
	r.POST("/api/v1/user-preferences/batch", h.UserPreferencesCreateBatch)
	r.PUT("/api/v1/user-preferences/:preference_id", h.UserPreferencesUpdate)
	r.DELETE("/api/v1/user-preferences/:preference_id", h.UserPreferencesDelete)
	r.GET("/api/v1/portfolios", h.PortfoliosList)
	r.GET("/api/v1/portfolios/:portfolio_id", h.PortfoliosGet)
	r.POST("/api/v1/portfolios", h.PortfoliosCreate)
	r.POST("/api/v1/portfolios/batch", h.PortfoliosCreateBatch)
	r.PUT("/api/v1/portfolios/:portfolio_id", h.PortfoliosUpdate)
	r.DELETE("/api/v1/portfolios/:portfolio_id", h.PortfoliosDelete)
	r.GET("/api/v1/positions", h.PositionsList)
	r.GET("/api/v1/positions/:position_id", h.PositionsGet)
	r.POST("/api/v1/positions", h.PositionsCreate)
	r.POST("/api/v1/positions/batch", h.PositionsCreateBatch)
	r.PUT("/api/v1/positions/:position_id", h.PositionsUpdate)
	r.DELETE("/api/v1/positions/:position_id", h.PositionsDelete)
	r.GET("/api/v1/orders", h.OrdersList)
	r.GET("/api/v1/orders/:order_id", h.OrdersGet)
	r.POST("/api/v1/orders", h.OrdersCreate)
	r.POST("/api/v1/orders/batch", h.OrdersCreateBatch)
	r.PUT("/api/v1/orders/:order_id", h.OrdersUpdate)
	r.DELETE("/api/v1/orders/:order_id", h.OrdersDelete)
	r.GET("/api/v1/trades", h.TradesList)
	r.GET("/api/v1/trades/:trade_id", h.TradesGet)
	r.POST("/api/v1/trades", h.TradesCreate)
	r.POST("/api/v1/trades/batch", h.TradesCreateBatch)
	r.PUT("/api/v1/trades/:trade_id", h.TradesUpdate)
	r.DELETE("/api/v1/trades/:trade_id", h.TradesDelete)
	r.GET("/api/v1/cash-transactions", h.CashTransactionsList)
	r.GET("/api/v1/cash-transactions/:transaction_id", h.CashTransactionsGet)
	r.POST("/api/v1/cash-transactions", h.CashTransactionsCreate)
	r.POST("/api/v1/cash-transactions/batch", h.CashTransactionsCreateBatch)
	r.PUT("/api/v1/cash-transactions/:transaction_id", h.CashTransactionsUpdate)
	r.DELETE("/api/v1/cash-transactions/:transaction_id", h.CashTransactionsDelete)
	r.GET("/api/v1/payments", h.PaymentsList)
	r.GET("/api/v1/payments/:payment_id", h.PaymentsGet)
	r.POST("/api/v1/payments", h.PaymentsCreate)
	r.POST("/api/v1/payments/batch", h.PaymentsCreateBatch)
	r.PUT("/api/v1/payments/:payment_id", h.PaymentsUpdate)
	r.DELETE("/api/v1/payments/:payment_id", h.PaymentsDelete)
	r.GET("/api/v1/settlements", h.SettlementsList)
	r.GET("/api/v1/settlements/:settlement_id", h.SettlementsGet)
	r.POST("/api/v1/settlements", h.SettlementsCreate)
	r.POST("/api/v1/settlements/batch", h.SettlementsCreateBatch)
	r.PUT("/api/v1/settlements/:settlement_id", h.SettlementsUpdate)
	r.DELETE("/api/v1/settlements/:settlement_id", h.SettlementsDelete)
	r.GET("/api/v1/market-data", h.MarketDataList)
	r.GET("/api/v1/market-data/:data_id", h.MarketDataGet)
	r.POST("/api/v1/market-data", h.MarketDataCreate)
	r.POST("/api/v1/market-data/batch", h.MarketDataCreateBatch)
	r.PUT("/api/v1/market-data/:data_id", h.MarketDataUpdate)
	r.DELETE("/api/v1/market-data/:data_id", h.MarketDataDelete)
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
