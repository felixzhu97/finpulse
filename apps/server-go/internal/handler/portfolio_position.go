package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func portfolioToJSON(p domain.PortfolioSchema) gin.H {
	return gin.H{"portfolio_id": p.PortfolioID, "account_id": p.AccountID, "name": p.Name, "base_currency": p.BaseCurrency, "created_at": p.CreatedAt}
}

func (h *Handler) PortfoliosList(c *gin.Context) {
	crudList(c, h, func() ([]domain.PortfolioSchema, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.PortfolioSvc.List(c.Request.Context(), limit, offset)
	}, portfolioToJSON)
}

func (h *Handler) PortfoliosGet(c *gin.Context) {
	crudGet(c, "portfolio_id", "Portfolio not found", h,
		func(id string) (*domain.PortfolioSchema, error) { return h.PortfolioSvc.GetByID(c.Request.Context(), id) },
		portfolioToJSON)
}

func (h *Handler) PortfoliosCreate(c *gin.Context) {
	var body struct {
		AccountID    string `json:"account_id" binding:"required"`
		Name         string `json:"name" binding:"required"`
		BaseCurrency string `json:"base_currency" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.PortfolioSchema{PortfolioID: uuid.New().String(), AccountID: body.AccountID, Name: body.Name, BaseCurrency: body.BaseCurrency}
	created, err := h.PortfolioSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, portfolioToJSON(*created))
}

func (h *Handler) PortfoliosCreateBatch(c *gin.Context) {
	var body []struct {
		AccountID    string `json:"account_id" binding:"required"`
		Name         string `json:"name" binding:"required"`
		BaseCurrency string `json:"base_currency" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.PortfolioSchema, len(body))
	for i, b := range body {
		entities[i] = domain.PortfolioSchema{PortfolioID: uuid.New().String(), AccountID: b.AccountID, Name: b.Name, BaseCurrency: b.BaseCurrency}
	}
	created, err := h.PortfolioSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = portfolioToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) PortfoliosUpdate(c *gin.Context) {
	id := c.Param("portfolio_id")
	var body struct {
		AccountID    string `json:"account_id" binding:"required"`
		Name         string `json:"name" binding:"required"`
		BaseCurrency string `json:"base_currency" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.PortfolioSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Portfolio not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.PortfolioSchema{PortfolioID: id, AccountID: body.AccountID, Name: body.Name, BaseCurrency: body.BaseCurrency, CreatedAt: existing.CreatedAt}
	updated, err := h.PortfolioSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, portfolioToJSON(*updated))
}

func (h *Handler) PortfoliosDelete(c *gin.Context) {
	crudDelete(c, "portfolio_id", "Portfolio not found", h, func(id string) (bool, error) {
		return h.PortfolioSvc.Delete(c.Request.Context(), id)
	})
}

func positionToJSON(p domain.Position) gin.H {
	return gin.H{"position_id": p.PositionID, "portfolio_id": p.PortfolioID, "instrument_id": p.InstrumentID, "quantity": p.Quantity, "cost_basis": p.CostBasis, "as_of_date": p.AsOfDate}
}

func (h *Handler) PositionsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Position, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.PositionSvc.List(c.Request.Context(), limit, offset)
	}, positionToJSON)
}

func (h *Handler) PositionsGet(c *gin.Context) {
	crudGet(c, "position_id", "Position not found", h,
		func(id string) (*domain.Position, error) { return h.PositionSvc.GetByID(c.Request.Context(), id) },
		positionToJSON)
}

func (h *Handler) PositionsCreate(c *gin.Context) {
	var body struct {
		PortfolioID  string   `json:"portfolio_id" binding:"required"`
		InstrumentID string   `json:"instrument_id" binding:"required"`
		Quantity     float64  `json:"quantity" binding:"required"`
		CostBasis    *float64 `json:"cost_basis"`
		AsOfDate     string   `json:"as_of_date"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.AsOfDate == "" {
		body.AsOfDate = time.Now().Format("2006-01-02")
	}
	entity := domain.Position{PositionID: uuid.New().String(), PortfolioID: body.PortfolioID, InstrumentID: body.InstrumentID, Quantity: body.Quantity, CostBasis: body.CostBasis, AsOfDate: body.AsOfDate}
	created, err := h.PositionSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, positionToJSON(*created))
}

func (h *Handler) PositionsCreateBatch(c *gin.Context) {
	var body []struct {
		PortfolioID  string   `json:"portfolio_id" binding:"required"`
		InstrumentID string   `json:"instrument_id" binding:"required"`
		Quantity     float64  `json:"quantity" binding:"required"`
		CostBasis    *float64 `json:"cost_basis"`
		AsOfDate     string   `json:"as_of_date"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	now := time.Now().Format("2006-01-02")
	entities := make([]domain.Position, len(body))
	for i, b := range body {
		ad := b.AsOfDate
		if ad == "" {
			ad = now
		}
		entities[i] = domain.Position{PositionID: uuid.New().String(), PortfolioID: b.PortfolioID, InstrumentID: b.InstrumentID, Quantity: b.Quantity, CostBasis: b.CostBasis, AsOfDate: ad}
	}
	created, err := h.PositionSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = positionToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) PositionsUpdate(c *gin.Context) {
	id := c.Param("position_id")
	var body struct {
		PortfolioID  string   `json:"portfolio_id" binding:"required"`
		InstrumentID string   `json:"instrument_id" binding:"required"`
		Quantity     float64  `json:"quantity" binding:"required"`
		CostBasis    *float64 `json:"cost_basis"`
		AsOfDate     string   `json:"as_of_date" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	_, err := h.PositionSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Position not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Position{PositionID: id, PortfolioID: body.PortfolioID, InstrumentID: body.InstrumentID, Quantity: body.Quantity, CostBasis: body.CostBasis, AsOfDate: body.AsOfDate}
	updated, err := h.PositionSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, positionToJSON(*updated))
}

func (h *Handler) PositionsDelete(c *gin.Context) {
	crudDelete(c, "position_id", "Position not found", h, func(id string) (bool, error) {
		return h.PositionSvc.Delete(c.Request.Context(), id)
	})
}
