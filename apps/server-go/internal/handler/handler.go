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

type Handler struct {
	QuotesSvc        *application.QuotesService
	InstrumentsSvc   *application.InstrumentsService
	AuthSvc          *application.AuthService
	BlockchainSvc    *application.BlockchainService
	CustomerRepo     CustomerRepo
	AccountRepo      AccountRepo
	WatchlistRepo    WatchlistRepo
	WatchlistItemRepo WatchlistItemRepo
	Cache            Cache
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
