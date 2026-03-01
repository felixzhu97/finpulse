package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func orderToJSON(o domain.Order) gin.H {
	return gin.H{"order_id": o.OrderID, "account_id": o.AccountID, "instrument_id": o.InstrumentID, "side": o.Side, "quantity": o.Quantity, "order_type": o.OrderType, "status": o.Status, "created_at": o.CreatedAt}
}

func (h *Handler) OrdersList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Order, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.OrderSvc.List(c.Request.Context(), limit, offset)
	}, orderToJSON)
}

func (h *Handler) OrdersGet(c *gin.Context) {
	crudGet(c, "order_id", "Order not found", h,
		func(id string) (*domain.Order, error) { return h.OrderSvc.GetByID(c.Request.Context(), id) },
		orderToJSON)
}

func (h *Handler) OrdersCreate(c *gin.Context) {
	var body struct {
		AccountID    string  `json:"account_id" binding:"required"`
		InstrumentID string  `json:"instrument_id" binding:"required"`
		Side         string  `json:"side" binding:"required"`
		Quantity     float64 `json:"quantity" binding:"required"`
		OrderType    string  `json:"order_type" binding:"required"`
		Status       string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Status == "" {
		body.Status = "pending"
	}
	entity := domain.Order{OrderID: uuid.New().String(), AccountID: body.AccountID, InstrumentID: body.InstrumentID, Side: body.Side, Quantity: body.Quantity, OrderType: body.OrderType, Status: body.Status}
	created, err := h.OrderSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, orderToJSON(*created))
}

func (h *Handler) OrdersCreateBatch(c *gin.Context) {
	var body []struct {
		AccountID    string  `json:"account_id" binding:"required"`
		InstrumentID string  `json:"instrument_id" binding:"required"`
		Side         string  `json:"side" binding:"required"`
		Quantity     float64 `json:"quantity" binding:"required"`
		OrderType    string  `json:"order_type" binding:"required"`
		Status       string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Order, len(body))
	for i, b := range body {
		status := b.Status
		if status == "" {
			status = "pending"
		}
		entities[i] = domain.Order{OrderID: uuid.New().String(), AccountID: b.AccountID, InstrumentID: b.InstrumentID, Side: b.Side, Quantity: b.Quantity, OrderType: b.OrderType, Status: status}
	}
	created, err := h.OrderSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = orderToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) OrdersUpdate(c *gin.Context) {
	id := c.Param("order_id")
	var body struct {
		AccountID    string  `json:"account_id" binding:"required"`
		InstrumentID string  `json:"instrument_id" binding:"required"`
		Side         string  `json:"side" binding:"required"`
		Quantity     float64 `json:"quantity" binding:"required"`
		OrderType    string  `json:"order_type" binding:"required"`
		Status       string  `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.OrderSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Order{OrderID: id, AccountID: body.AccountID, InstrumentID: body.InstrumentID, Side: body.Side, Quantity: body.Quantity, OrderType: body.OrderType, Status: body.Status, CreatedAt: existing.CreatedAt}
	updated, err := h.OrderSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, orderToJSON(*updated))
}

func (h *Handler) OrdersDelete(c *gin.Context) {
	crudDelete(c, "order_id", "Order not found", h, func(id string) (bool, error) {
		return h.OrderSvc.Delete(c.Request.Context(), id)
	})
}

func tradeToJSON(t domain.Trade) gin.H {
	return gin.H{"trade_id": t.TradeID, "order_id": t.OrderID, "quantity": t.Quantity, "price": t.Price, "fee": t.Fee, "executed_at": t.ExecutedAt}
}

func (h *Handler) TradesList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Trade, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.TradeSvc.List(c.Request.Context(), limit, offset)
	}, tradeToJSON)
}

func (h *Handler) TradesGet(c *gin.Context) {
	crudGet(c, "trade_id", "Trade not found", h,
		func(id string) (*domain.Trade, error) { return h.TradeSvc.GetByID(c.Request.Context(), id) },
		tradeToJSON)
}

func (h *Handler) TradesCreate(c *gin.Context) {
	var body struct {
		OrderID  string   `json:"order_id" binding:"required"`
		Quantity float64  `json:"quantity" binding:"required"`
		Price    float64  `json:"price" binding:"required"`
		Fee      *float64 `json:"fee"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Trade{TradeID: uuid.New().String(), OrderID: body.OrderID, Quantity: body.Quantity, Price: body.Price, Fee: body.Fee}
	created, err := h.TradeSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, tradeToJSON(*created))
}

func (h *Handler) TradesCreateBatch(c *gin.Context) {
	var body []struct {
		OrderID  string   `json:"order_id" binding:"required"`
		Quantity float64  `json:"quantity" binding:"required"`
		Price    float64  `json:"price" binding:"required"`
		Fee      *float64 `json:"fee"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Trade, len(body))
	for i, b := range body {
		entities[i] = domain.Trade{TradeID: uuid.New().String(), OrderID: b.OrderID, Quantity: b.Quantity, Price: b.Price, Fee: b.Fee}
	}
	created, err := h.TradeSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = tradeToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) TradesUpdate(c *gin.Context) {
	id := c.Param("trade_id")
	var body struct {
		OrderID  string   `json:"order_id" binding:"required"`
		Quantity float64  `json:"quantity" binding:"required"`
		Price    float64  `json:"price" binding:"required"`
		Fee      *float64 `json:"fee"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.TradeSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Trade not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Trade{TradeID: id, OrderID: body.OrderID, Quantity: body.Quantity, Price: body.Price, Fee: body.Fee, ExecutedAt: existing.ExecutedAt}
	updated, err := h.TradeSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tradeToJSON(*updated))
}

func (h *Handler) TradesDelete(c *gin.Context) {
	crudDelete(c, "trade_id", "Trade not found", h, func(id string) (bool, error) {
		return h.TradeSvc.Delete(c.Request.Context(), id)
	})
}
