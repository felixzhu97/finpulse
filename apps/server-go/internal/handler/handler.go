package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"finpulse/server-go/internal/application"
)

type Handler struct {
	QuotesSvc             *application.QuotesService
	InstrumentsSvc        *application.InstrumentsService
	AuthSvc               *application.AuthService
	BlockchainSvc         *application.BlockchainService
	CustomerSvc           *application.CustomerService
	AccountSvc            *application.AccountService
	BondSvc               *application.BondService
	OptionSvc             *application.OptionService
	WatchlistSvc          *application.WatchlistService
	WatchlistItemSvc      *application.WatchlistItemService
	UserPreferenceSvc     *application.UserPreferenceService
	PortfolioSvc          *application.PortfolioService
	PositionSvc           *application.PositionService
	OrderSvc              *application.OrderService
	TradeSvc              *application.TradeService
	CashTransactionSvc    *application.CashTransactionService
	PaymentSvc            *application.PaymentService
	SettlementSvc         *application.SettlementService
	MarketDataSvc         *application.MarketDataService
	Cache                 application.Cache
}

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *Handler) Quotes(c *gin.Context) {
	out, err := h.QuotesSvc.GetQuotes(c.Request.Context(), c.Query("symbols"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if out == nil {
		c.JSON(http.StatusOK, gin.H{})
		return
	}
	c.JSON(http.StatusOK, out)
}
