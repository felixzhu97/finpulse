package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/domain"
)

func marketDataToJSON(m domain.MarketData) gin.H {
	return gin.H{"data_id": m.DataID, "instrument_id": m.InstrumentID, "timestamp": m.Timestamp, "open": m.Open, "high": m.High, "low": m.Low, "close": m.Close, "volume": m.Volume, "change_pct": m.ChangePct}
}

func parseMarketDataTimestamp(s string) (time.Time, bool) {
	ts, err := time.Parse(time.RFC3339, s)
	if err != nil {
		ts, err = time.Parse("2006-01-02T15:04:05Z07:00", s)
	}
	if err != nil {
		return time.Time{}, false
	}
	return ts, true
}

func (h *Handler) MarketDataList(c *gin.Context) {
	crudList(c, h, func() ([]domain.MarketData, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.MarketDataSvc.List(c.Request.Context(), limit, offset)
	}, marketDataToJSON)
}

func (h *Handler) MarketDataGet(c *gin.Context) {
	crudGet(c, "data_id", "Market data not found", h,
		func(id string) (*domain.MarketData, error) { return h.MarketDataSvc.GetByID(c.Request.Context(), id) },
		marketDataToJSON)
}

func (h *Handler) MarketDataCreate(c *gin.Context) {
	var body struct {
		InstrumentID string   `json:"instrument_id" binding:"required"`
		Timestamp    string   `json:"timestamp" binding:"required"`
		Open         *float64 `json:"open"`
		High         *float64 `json:"high"`
		Low          *float64 `json:"low"`
		Close        float64  `json:"close" binding:"required"`
		Volume       *float64 `json:"volume"`
		ChangePct    *float64 `json:"change_pct"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	ts, ok := parseMarketDataTimestamp(body.Timestamp)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid timestamp format"})
		return
	}
	entity := domain.MarketData{DataID: uuid.New().String(), InstrumentID: body.InstrumentID, Timestamp: ts, Open: body.Open, High: body.High, Low: body.Low, Close: body.Close, Volume: body.Volume, ChangePct: body.ChangePct}
	created, err := h.MarketDataSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, marketDataToJSON(*created))
}

func (h *Handler) MarketDataCreateBatch(c *gin.Context) {
	var body []struct {
		InstrumentID string   `json:"instrument_id" binding:"required"`
		Timestamp    string   `json:"timestamp" binding:"required"`
		Open         *float64 `json:"open"`
		High         *float64 `json:"high"`
		Low          *float64 `json:"low"`
		Close        float64  `json:"close" binding:"required"`
		Volume       *float64 `json:"volume"`
		ChangePct    *float64 `json:"change_pct"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.MarketData, len(body))
	for i, b := range body {
		ts, ok := parseMarketDataTimestamp(b.Timestamp)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid timestamp format"})
			return
		}
		entities[i] = domain.MarketData{DataID: uuid.New().String(), InstrumentID: b.InstrumentID, Timestamp: ts, Open: b.Open, High: b.High, Low: b.Low, Close: b.Close, Volume: b.Volume, ChangePct: b.ChangePct}
	}
	created, err := h.MarketDataSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = marketDataToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) MarketDataUpdate(c *gin.Context) {
	id := c.Param("data_id")
	var body struct {
		InstrumentID string   `json:"instrument_id" binding:"required"`
		Timestamp    string   `json:"timestamp" binding:"required"`
		Open         *float64 `json:"open"`
		High         *float64 `json:"high"`
		Low          *float64 `json:"low"`
		Close        float64  `json:"close" binding:"required"`
		Volume       *float64 `json:"volume"`
		ChangePct    *float64 `json:"change_pct"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	ts, ok := parseMarketDataTimestamp(body.Timestamp)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid timestamp format"})
		return
	}
	entity := domain.MarketData{DataID: id, InstrumentID: body.InstrumentID, Timestamp: ts, Open: body.Open, High: body.High, Low: body.Low, Close: body.Close, Volume: body.Volume, ChangePct: body.ChangePct}
	updated, err := h.MarketDataSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, marketDataToJSON(*updated))
}

func (h *Handler) MarketDataDelete(c *gin.Context) {
	crudDelete(c, "data_id", "Market data not found", h, func(id string) (bool, error) {
		return h.MarketDataSvc.Delete(c.Request.Context(), id)
	})
}
