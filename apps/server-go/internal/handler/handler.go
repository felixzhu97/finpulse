package handler

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

type Cache interface {
	Get(ctx context.Context, key string) (interface{}, error)
	Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error
	Delete(ctx context.Context, keys ...string) error
	DeleteByPrefix(ctx context.Context, prefix string) error
}

type CustomerRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Customer, error)
	GetByID(ctx context.Context, customerID string) (*domain.Customer, error)
	Add(ctx context.Context, c *domain.Customer) (*domain.Customer, error)
	AddMany(ctx context.Context, entities []domain.Customer) ([]domain.Customer, error)
	Save(ctx context.Context, c *domain.Customer) (*domain.Customer, error)
	Remove(ctx context.Context, customerID string) (bool, error)
}

type AccountRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Account, error)
	GetByID(ctx context.Context, accountID string) (*domain.Account, error)
	Add(ctx context.Context, a *domain.Account) (*domain.Account, error)
	AddMany(ctx context.Context, entities []domain.Account) ([]domain.Account, error)
	Save(ctx context.Context, a *domain.Account) (*domain.Account, error)
	Remove(ctx context.Context, accountID string) (bool, error)
}

type InstrumentRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Instrument, error)
	GetByID(ctx context.Context, instrumentID string) (*domain.Instrument, error)
	Add(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error)
	AddMany(ctx context.Context, entities []domain.Instrument) ([]domain.Instrument, error)
	Save(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error)
	Remove(ctx context.Context, instrumentID string) (bool, error)
}

type BondRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Bond, error)
	GetByID(ctx context.Context, bondID string) (*domain.Bond, error)
	Add(ctx context.Context, b *domain.Bond) (*domain.Bond, error)
	AddMany(ctx context.Context, entities []domain.Bond) ([]domain.Bond, error)
	Save(ctx context.Context, b *domain.Bond) (*domain.Bond, error)
	Remove(ctx context.Context, bondID string) (bool, error)
}

type OptionRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Option, error)
	GetByID(ctx context.Context, optionID string) (*domain.Option, error)
	Add(ctx context.Context, o *domain.Option) (*domain.Option, error)
	AddMany(ctx context.Context, entities []domain.Option) ([]domain.Option, error)
	Save(ctx context.Context, o *domain.Option) (*domain.Option, error)
	Remove(ctx context.Context, optionID string) (bool, error)
}

type WatchlistRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Watchlist, error)
	GetByID(ctx context.Context, watchlistID string) (*domain.Watchlist, error)
	Add(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error)
	AddMany(ctx context.Context, entities []domain.Watchlist) ([]domain.Watchlist, error)
	Save(ctx context.Context, w *domain.Watchlist) (*domain.Watchlist, error)
	Remove(ctx context.Context, watchlistID string) (bool, error)
}

type WatchlistItemRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.WatchlistItem, error)
	GetByID(ctx context.Context, watchlistItemID string) (*domain.WatchlistItem, error)
	Add(ctx context.Context, w *domain.WatchlistItem) (*domain.WatchlistItem, error)
	AddMany(ctx context.Context, entities []domain.WatchlistItem) ([]domain.WatchlistItem, error)
	Save(ctx context.Context, w *domain.WatchlistItem) (*domain.WatchlistItem, error)
	Remove(ctx context.Context, watchlistItemID string) (bool, error)
}

type UserPreferenceRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.UserPreference, error)
	GetByID(ctx context.Context, preferenceID string) (*domain.UserPreference, error)
	Add(ctx context.Context, u *domain.UserPreference) (*domain.UserPreference, error)
	AddMany(ctx context.Context, entities []domain.UserPreference) ([]domain.UserPreference, error)
	Save(ctx context.Context, u *domain.UserPreference) (*domain.UserPreference, error)
	Remove(ctx context.Context, preferenceID string) (bool, error)
}

type PortfolioRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.PortfolioSchema, error)
	GetByID(ctx context.Context, portfolioID string) (*domain.PortfolioSchema, error)
	Add(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error)
	AddMany(ctx context.Context, entities []domain.PortfolioSchema) ([]domain.PortfolioSchema, error)
	Save(ctx context.Context, p *domain.PortfolioSchema) (*domain.PortfolioSchema, error)
	Remove(ctx context.Context, portfolioID string) (bool, error)
}

type PositionRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Position, error)
	GetByID(ctx context.Context, positionID string) (*domain.Position, error)
	Add(ctx context.Context, p *domain.Position) (*domain.Position, error)
	AddMany(ctx context.Context, entities []domain.Position) ([]domain.Position, error)
	Save(ctx context.Context, p *domain.Position) (*domain.Position, error)
	Remove(ctx context.Context, positionID string) (bool, error)
}

type OrderRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Order, error)
	GetByID(ctx context.Context, orderID string) (*domain.Order, error)
	Add(ctx context.Context, o *domain.Order) (*domain.Order, error)
	AddMany(ctx context.Context, entities []domain.Order) ([]domain.Order, error)
	Save(ctx context.Context, o *domain.Order) (*domain.Order, error)
	Remove(ctx context.Context, orderID string) (bool, error)
}

type TradeRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Trade, error)
	GetByID(ctx context.Context, tradeID string) (*domain.Trade, error)
	Add(ctx context.Context, t *domain.Trade) (*domain.Trade, error)
	AddMany(ctx context.Context, entities []domain.Trade) ([]domain.Trade, error)
	Save(ctx context.Context, t *domain.Trade) (*domain.Trade, error)
	Remove(ctx context.Context, tradeID string) (bool, error)
}

type CashTransactionRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.CashTransaction, error)
	GetByID(ctx context.Context, transactionID string) (*domain.CashTransaction, error)
	Add(ctx context.Context, c *domain.CashTransaction) (*domain.CashTransaction, error)
	AddMany(ctx context.Context, entities []domain.CashTransaction) ([]domain.CashTransaction, error)
	Save(ctx context.Context, c *domain.CashTransaction) (*domain.CashTransaction, error)
	Remove(ctx context.Context, transactionID string) (bool, error)
}

type PaymentRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Payment, error)
	GetByID(ctx context.Context, paymentID string) (*domain.Payment, error)
	Add(ctx context.Context, p *domain.Payment) (*domain.Payment, error)
	AddMany(ctx context.Context, entities []domain.Payment) ([]domain.Payment, error)
	Save(ctx context.Context, p *domain.Payment) (*domain.Payment, error)
	Remove(ctx context.Context, paymentID string) (bool, error)
}

type SettlementRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.Settlement, error)
	GetByID(ctx context.Context, settlementID string) (*domain.Settlement, error)
	Add(ctx context.Context, s *domain.Settlement) (*domain.Settlement, error)
	AddMany(ctx context.Context, entities []domain.Settlement) ([]domain.Settlement, error)
	Save(ctx context.Context, s *domain.Settlement) (*domain.Settlement, error)
	Remove(ctx context.Context, settlementID string) (bool, error)
}

type MarketDataRepo interface {
	List(ctx context.Context, limit, offset int) ([]domain.MarketData, error)
	GetByID(ctx context.Context, dataID string) (*domain.MarketData, error)
	Add(ctx context.Context, m *domain.MarketData) (*domain.MarketData, error)
	AddMany(ctx context.Context, entities []domain.MarketData) ([]domain.MarketData, error)
	Save(ctx context.Context, m *domain.MarketData) (*domain.MarketData, error)
	Remove(ctx context.Context, dataID string) (bool, error)
}

type Handler struct {
	QuotesSvc        *application.QuotesService
	InstrumentsSvc   *application.InstrumentsService
	InstrumentRepo   InstrumentRepo
	BondRepo         BondRepo
	OptionRepo       OptionRepo
	AuthSvc          *application.AuthService
	BlockchainSvc    *application.BlockchainService
	CustomerRepo     CustomerRepo
	AccountRepo      AccountRepo
	WatchlistRepo       WatchlistRepo
	WatchlistItemRepo   WatchlistItemRepo
	UserPreferenceRepo  UserPreferenceRepo
	PortfolioRepo       PortfolioRepo
	PositionRepo       PositionRepo
	OrderRepo          OrderRepo
	TradeRepo          TradeRepo
	CashTransactionRepo CashTransactionRepo
	PaymentRepo        PaymentRepo
	SettlementRepo     SettlementRepo
	MarketDataRepo     MarketDataRepo
	Cache              Cache
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

func (h *Handler) Instruments(c *gin.Context) {
	limit, offset := 100, 0
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}
	if o := c.Query("offset"); o != "" {
		if n, err := strconv.Atoi(o); err == nil && n >= 0 {
			offset = n
		}
	}
	list, err := h.InstrumentsSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}
