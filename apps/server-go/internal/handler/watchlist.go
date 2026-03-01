package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func (h *Handler) WatchlistsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.WatchlistSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = watchlistToJSON(e)
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) WatchlistsGet(c *gin.Context) {
	id := c.Param("watchlist_id")
	entity, err := h.WatchlistSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Watchlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watchlistToJSON(*entity))
}

func (h *Handler) WatchlistsCreate(c *gin.Context) {
	var body struct {
		CustomerID string `json:"customer_id" binding:"required"`
		Name       string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Watchlist{
		WatchlistID: uuid.New().String(),
		CustomerID:  body.CustomerID,
		Name:        body.Name,
	}
	created, err := h.WatchlistSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, watchlistToJSON(*created))
}

func (h *Handler) WatchlistsCreateBatch(c *gin.Context) {
	var body []struct {
		CustomerID string `json:"customer_id" binding:"required"`
		Name       string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Watchlist, len(body))
	for i, b := range body {
		entities[i] = domain.Watchlist{
			WatchlistID: uuid.New().String(),
			CustomerID:  b.CustomerID,
			Name:        b.Name,
		}
	}
	created, err := h.WatchlistSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = watchlistToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) WatchlistsUpdate(c *gin.Context) {
	id := c.Param("watchlist_id")
	var body struct {
		CustomerID string `json:"customer_id" binding:"required"`
		Name       string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.WatchlistSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Watchlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Watchlist{
		WatchlistID: id,
		CustomerID:  body.CustomerID,
		Name:        body.Name,
		CreatedAt:   existing.CreatedAt,
	}
	updated, err := h.WatchlistSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watchlistToJSON(*updated))
}

func (h *Handler) WatchlistsDelete(c *gin.Context) {
	id := c.Param("watchlist_id")
	ok, err := h.WatchlistSvc.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Watchlist not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func watchlistToJSON(w domain.Watchlist) gin.H {
	return gin.H{
		"watchlist_id": w.WatchlistID,
		"customer_id":  w.CustomerID,
		"name":         w.Name,
		"created_at":   w.CreatedAt,
	}
}

func (h *Handler) WatchlistItemsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.WatchlistItemSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = watchlistItemToJSON(e)
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) WatchlistItemsGet(c *gin.Context) {
	id := c.Param("watchlist_item_id")
	entity, err := h.WatchlistItemSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Watchlist item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watchlistItemToJSON(*entity))
}

func (h *Handler) WatchlistItemsCreate(c *gin.Context) {
	var body struct {
		WatchlistID  string `json:"watchlist_id" binding:"required"`
		InstrumentID string `json:"instrument_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.WatchlistItem{
		WatchlistItemID: uuid.New().String(),
		WatchlistID:     body.WatchlistID,
		InstrumentID:    body.InstrumentID,
	}
	created, err := h.WatchlistItemSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, watchlistItemToJSON(*created))
}

func (h *Handler) WatchlistItemsCreateBatch(c *gin.Context) {
	var body []struct {
		WatchlistID  string `json:"watchlist_id" binding:"required"`
		InstrumentID string `json:"instrument_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.WatchlistItem, len(body))
	for i, b := range body {
		entities[i] = domain.WatchlistItem{
			WatchlistItemID: uuid.New().String(),
			WatchlistID:     b.WatchlistID,
			InstrumentID:    b.InstrumentID,
		}
	}
	created, err := h.WatchlistItemSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = watchlistItemToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) WatchlistItemsUpdate(c *gin.Context) {
	id := c.Param("watchlist_item_id")
	var body struct {
		WatchlistID  string `json:"watchlist_id" binding:"required"`
		InstrumentID string `json:"instrument_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.WatchlistItemSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Watchlist item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.WatchlistItem{
		WatchlistItemID: id,
		WatchlistID:     body.WatchlistID,
		InstrumentID:    body.InstrumentID,
		AddedAt:         existing.AddedAt,
	}
	updated, err := h.WatchlistItemSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watchlistItemToJSON(*updated))
}

func (h *Handler) WatchlistItemsDelete(c *gin.Context) {
	id := c.Param("watchlist_item_id")
	ok, err := h.WatchlistItemSvc.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Watchlist item not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func watchlistItemToJSON(w domain.WatchlistItem) gin.H {
	return gin.H{
		"watchlist_item_id": w.WatchlistItemID,
		"watchlist_id":      w.WatchlistID,
		"instrument_id":     w.InstrumentID,
		"added_at":          w.AddedAt,
	}
}
