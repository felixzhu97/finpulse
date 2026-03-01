package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func (h *Handler) InstrumentsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.InstrumentsSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = instrumentToJSON(e)
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) InstrumentsGet(c *gin.Context) {
	id := c.Param("instrument_id")
	entity, err := h.InstrumentsSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Instrument not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, instrumentToJSON(*entity))
}

func (h *Handler) InstrumentsCreate(c *gin.Context) {
	var body struct {
		Symbol     string  `json:"symbol" binding:"required"`
		Name       *string `json:"name"`
		AssetClass *string `json:"asset_class"`
		Currency   *string `json:"currency"`
		Exchange   *string `json:"exchange"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Instrument{
		InstrumentID: uuid.New().String(),
		Symbol:       body.Symbol,
		Name:         body.Name,
		AssetClass:   body.AssetClass,
		Currency:     body.Currency,
		Exchange:     body.Exchange,
	}
	created, err := h.InstrumentsSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, instrumentToJSON(*created))
}

func (h *Handler) InstrumentsCreateBatch(c *gin.Context) {
	var body []struct {
		Symbol     string  `json:"symbol" binding:"required"`
		Name       *string `json:"name"`
		AssetClass *string `json:"asset_class"`
		Currency   *string `json:"currency"`
		Exchange   *string `json:"exchange"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Instrument, len(body))
	for i, b := range body {
		entities[i] = domain.Instrument{
			InstrumentID: uuid.New().String(),
			Symbol:       b.Symbol,
			Name:         b.Name,
			AssetClass:   b.AssetClass,
			Currency:     b.Currency,
			Exchange:     b.Exchange,
		}
	}
	created, err := h.InstrumentsSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = instrumentToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) InstrumentsUpdate(c *gin.Context) {
	id := c.Param("instrument_id")
	var body struct {
		Symbol     string  `json:"symbol" binding:"required"`
		Name       *string `json:"name"`
		AssetClass *string `json:"asset_class"`
		Currency   *string `json:"currency"`
		Exchange   *string `json:"exchange"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Instrument{
		InstrumentID: id,
		Symbol:       body.Symbol,
		Name:         body.Name,
		AssetClass:   body.AssetClass,
		Currency:     body.Currency,
		Exchange:     body.Exchange,
	}
	updated, err := h.InstrumentsSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Instrument not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, instrumentToJSON(*updated))
}

func (h *Handler) InstrumentsDelete(c *gin.Context) {
	id := c.Param("instrument_id")
	ok, err := h.InstrumentsSvc.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Instrument not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func instrumentToJSON(i domain.Instrument) gin.H {
	return gin.H{
		"instrument_id": i.InstrumentID,
		"symbol":        i.Symbol,
		"name":          i.Name,
		"asset_class":   i.AssetClass,
		"currency":      i.Currency,
		"exchange":      i.Exchange,
	}
}
