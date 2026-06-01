package handler

import (
	"errors"
	"net/http"
	"strings"

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

func (h *Handler) QuotesHistory(c *gin.Context) {
	symbolsParam := c.Query("symbols")
	if symbolsParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "symbols is required"})
		return
	}

	minutesStr := c.DefaultQuery("minutes", "5")
	minutes := 5
	if n, err := parsePositiveInt(minutesStr); err == nil && n >= 1 && n <= 60 {
		minutes = n
	}

	var symbols []string
	for _, p := range strings.Split(symbolsParam, ",") {
		p = strings.TrimSpace(strings.ToUpper(p))
		if p != "" {
			symbols = append(symbols, p)
		}
	}
	if len(symbols) == 0 {
		c.JSON(http.StatusOK, gin.H{})
		return
	}

	out, err := h.QuotesSvc.GetHistory(c.Request.Context(), symbols, minutes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, out)
}

func parsePositiveInt(s string) (int, error) {
	n := 0
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, errors.New("not a number")
		}
		n = n*10 + int(c-'0')
	}
	return n, nil
}
