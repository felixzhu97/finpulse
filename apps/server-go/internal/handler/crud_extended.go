package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"finpulse/server-go/internal/domain"
)

func crudList[T any](c *gin.Context, h *Handler, fn func() ([]T, error), toJSON func(T) gin.H) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := fn()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = toJSON(e)
	}
	c.JSON(http.StatusOK, out)
}

func crudGet[T any](c *gin.Context, idParam string, notFound string, h *Handler, fn func(string) (*T, error), toJSON func(T) gin.H) {
	id := c.Param(idParam)
	entity, err := fn(id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": notFound})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, toJSON(*entity))
}

func crudDelete(c *gin.Context, idParam, notFound string, h *Handler, fn func(string) (bool, error)) {
	id := c.Param(idParam)
	ok, err := fn(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": notFound})
		return
	}
	c.Status(http.StatusNoContent)
}

func portfolioToJSON(p domain.PortfolioSchema) gin.H {
	return gin.H{"portfolio_id": p.PortfolioID, "account_id": p.AccountID, "name": p.Name, "base_currency": p.BaseCurrency, "created_at": p.CreatedAt}
}

func (h *Handler) PortfoliosList(c *gin.Context) {
	crudList(c, h, func() ([]domain.PortfolioSchema, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.PortfolioRepo.List(c.Request.Context(), limit, offset)
	}, portfolioToJSON)
}

func (h *Handler) PortfoliosGet(c *gin.Context) {
	crudGet(c, "portfolio_id", "Portfolio not found", h,
		func(id string) (*domain.PortfolioSchema, error) { return h.PortfolioRepo.GetByID(c.Request.Context(), id) },
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
	created, err := h.PortfolioRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.PortfolioRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.PortfolioRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Portfolio not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.PortfolioSchema{PortfolioID: id, AccountID: body.AccountID, Name: body.Name, BaseCurrency: body.BaseCurrency, CreatedAt: existing.CreatedAt}
	updated, err := h.PortfolioRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, portfolioToJSON(*updated))
}

func (h *Handler) PortfoliosDelete(c *gin.Context) {
	crudDelete(c, "portfolio_id", "Portfolio not found", h, func(id string) (bool, error) {
		return h.PortfolioRepo.Remove(c.Request.Context(), id)
	})
}

func positionToJSON(p domain.Position) gin.H {
	return gin.H{"position_id": p.PositionID, "portfolio_id": p.PortfolioID, "instrument_id": p.InstrumentID, "quantity": p.Quantity, "cost_basis": p.CostBasis, "as_of_date": p.AsOfDate}
}

func (h *Handler) PositionsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Position, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.PositionRepo.List(c.Request.Context(), limit, offset)
	}, positionToJSON)
}

func (h *Handler) PositionsGet(c *gin.Context) {
	crudGet(c, "position_id", "Position not found", h,
		func(id string) (*domain.Position, error) { return h.PositionRepo.GetByID(c.Request.Context(), id) },
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
	created, err := h.PositionRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.PositionRepo.AddMany(c.Request.Context(), entities)
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
	_, err := h.PositionRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Position not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Position{PositionID: id, PortfolioID: body.PortfolioID, InstrumentID: body.InstrumentID, Quantity: body.Quantity, CostBasis: body.CostBasis, AsOfDate: body.AsOfDate}
	updated, err := h.PositionRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, positionToJSON(*updated))
}

func (h *Handler) PositionsDelete(c *gin.Context) {
	crudDelete(c, "position_id", "Position not found", h, func(id string) (bool, error) {
		return h.PositionRepo.Remove(c.Request.Context(), id)
	})
}

func orderToJSON(o domain.Order) gin.H {
	return gin.H{"order_id": o.OrderID, "account_id": o.AccountID, "instrument_id": o.InstrumentID, "side": o.Side, "quantity": o.Quantity, "order_type": o.OrderType, "status": o.Status, "created_at": o.CreatedAt}
}

func (h *Handler) OrdersList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Order, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.OrderRepo.List(c.Request.Context(), limit, offset)
	}, orderToJSON)
}

func (h *Handler) OrdersGet(c *gin.Context) {
	crudGet(c, "order_id", "Order not found", h,
		func(id string) (*domain.Order, error) { return h.OrderRepo.GetByID(c.Request.Context(), id) },
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
	created, err := h.OrderRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.OrderRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.OrderRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Order{OrderID: id, AccountID: body.AccountID, InstrumentID: body.InstrumentID, Side: body.Side, Quantity: body.Quantity, OrderType: body.OrderType, Status: body.Status, CreatedAt: existing.CreatedAt}
	updated, err := h.OrderRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, orderToJSON(*updated))
}

func (h *Handler) OrdersDelete(c *gin.Context) {
	crudDelete(c, "order_id", "Order not found", h, func(id string) (bool, error) {
		return h.OrderRepo.Remove(c.Request.Context(), id)
	})
}

func tradeToJSON(t domain.Trade) gin.H {
	return gin.H{"trade_id": t.TradeID, "order_id": t.OrderID, "quantity": t.Quantity, "price": t.Price, "fee": t.Fee, "executed_at": t.ExecutedAt}
}

func (h *Handler) TradesList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Trade, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.TradeRepo.List(c.Request.Context(), limit, offset)
	}, tradeToJSON)
}

func (h *Handler) TradesGet(c *gin.Context) {
	crudGet(c, "trade_id", "Trade not found", h,
		func(id string) (*domain.Trade, error) { return h.TradeRepo.GetByID(c.Request.Context(), id) },
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
	created, err := h.TradeRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.TradeRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.TradeRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Trade not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Trade{TradeID: id, OrderID: body.OrderID, Quantity: body.Quantity, Price: body.Price, Fee: body.Fee, ExecutedAt: existing.ExecutedAt}
	updated, err := h.TradeRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tradeToJSON(*updated))
}

func (h *Handler) TradesDelete(c *gin.Context) {
	crudDelete(c, "trade_id", "Trade not found", h, func(id string) (bool, error) {
		return h.TradeRepo.Remove(c.Request.Context(), id)
	})
}

func cashTransactionToJSON(c domain.CashTransaction) gin.H {
	return gin.H{"transaction_id": c.TransactionID, "account_id": c.AccountID, "type": c.Type, "amount": c.Amount, "currency": c.Currency, "status": c.Status, "created_at": c.CreatedAt}
}

func (h *Handler) CashTransactionsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.CashTransaction, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.CashTransactionRepo.List(c.Request.Context(), limit, offset)
	}, cashTransactionToJSON)
}

func (h *Handler) CashTransactionsGet(c *gin.Context) {
	crudGet(c, "transaction_id", "Cash transaction not found", h,
		func(id string) (*domain.CashTransaction, error) { return h.CashTransactionRepo.GetByID(c.Request.Context(), id) },
		cashTransactionToJSON)
}

func (h *Handler) CashTransactionsCreate(c *gin.Context) {
	var body struct {
		AccountID string  `json:"account_id" binding:"required"`
		Type      string  `json:"type" binding:"required"`
		Amount    float64 `json:"amount" binding:"required"`
		Currency  string  `json:"currency" binding:"required"`
		Status    string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Status == "" {
		body.Status = "completed"
	}
	entity := domain.CashTransaction{TransactionID: uuid.New().String(), AccountID: body.AccountID, Type: body.Type, Amount: body.Amount, Currency: body.Currency, Status: body.Status}
	created, err := h.CashTransactionRepo.Add(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, cashTransactionToJSON(*created))
}

func (h *Handler) CashTransactionsCreateBatch(c *gin.Context) {
	var body []struct {
		AccountID string  `json:"account_id" binding:"required"`
		Type      string  `json:"type" binding:"required"`
		Amount    float64 `json:"amount" binding:"required"`
		Currency  string  `json:"currency" binding:"required"`
		Status    string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.CashTransaction, len(body))
	for i, b := range body {
		status := b.Status
		if status == "" {
			status = "completed"
		}
		entities[i] = domain.CashTransaction{TransactionID: uuid.New().String(), AccountID: b.AccountID, Type: b.Type, Amount: b.Amount, Currency: b.Currency, Status: status}
	}
	created, err := h.CashTransactionRepo.AddMany(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = cashTransactionToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) CashTransactionsUpdate(c *gin.Context) {
	id := c.Param("transaction_id")
	var body struct {
		AccountID string  `json:"account_id" binding:"required"`
		Type      string  `json:"type" binding:"required"`
		Amount    float64 `json:"amount" binding:"required"`
		Currency  string  `json:"currency" binding:"required"`
		Status    string  `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.CashTransactionRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Cash transaction not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.CashTransaction{TransactionID: id, AccountID: body.AccountID, Type: body.Type, Amount: body.Amount, Currency: body.Currency, Status: body.Status, CreatedAt: existing.CreatedAt}
	updated, err := h.CashTransactionRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, cashTransactionToJSON(*updated))
}

func (h *Handler) CashTransactionsDelete(c *gin.Context) {
	crudDelete(c, "transaction_id", "Cash transaction not found", h, func(id string) (bool, error) {
		return h.CashTransactionRepo.Remove(c.Request.Context(), id)
	})
}

func paymentToJSON(p domain.Payment) gin.H {
	return gin.H{"payment_id": p.PaymentID, "account_id": p.AccountID, "counterparty": p.Counterparty, "amount": p.Amount, "currency": p.Currency, "status": p.Status, "created_at": p.CreatedAt}
}

func (h *Handler) PaymentsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Payment, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.PaymentRepo.List(c.Request.Context(), limit, offset)
	}, paymentToJSON)
}

func (h *Handler) PaymentsGet(c *gin.Context) {
	crudGet(c, "payment_id", "Payment not found", h,
		func(id string) (*domain.Payment, error) { return h.PaymentRepo.GetByID(c.Request.Context(), id) },
		paymentToJSON)
}

func (h *Handler) PaymentsCreate(c *gin.Context) {
	var body struct {
		AccountID   string  `json:"account_id" binding:"required"`
		Counterparty *string `json:"counterparty"`
		Amount      float64 `json:"amount" binding:"required"`
		Currency    string  `json:"currency" binding:"required"`
		Status      string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Status == "" {
		body.Status = "pending"
	}
	entity := domain.Payment{PaymentID: uuid.New().String(), AccountID: body.AccountID, Counterparty: body.Counterparty, Amount: body.Amount, Currency: body.Currency, Status: body.Status}
	created, err := h.PaymentRepo.Add(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, paymentToJSON(*created))
}

func (h *Handler) PaymentsCreateBatch(c *gin.Context) {
	var body []struct {
		AccountID   string  `json:"account_id" binding:"required"`
		Counterparty *string `json:"counterparty"`
		Amount      float64 `json:"amount" binding:"required"`
		Currency    string  `json:"currency" binding:"required"`
		Status      string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Payment, len(body))
	for i, b := range body {
		status := b.Status
		if status == "" {
			status = "pending"
		}
		entities[i] = domain.Payment{PaymentID: uuid.New().String(), AccountID: b.AccountID, Counterparty: b.Counterparty, Amount: b.Amount, Currency: b.Currency, Status: status}
	}
	created, err := h.PaymentRepo.AddMany(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = paymentToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) PaymentsUpdate(c *gin.Context) {
	id := c.Param("payment_id")
	var body struct {
		AccountID   string  `json:"account_id" binding:"required"`
		Counterparty *string `json:"counterparty"`
		Amount      float64 `json:"amount" binding:"required"`
		Currency    string  `json:"currency" binding:"required"`
		Status      string  `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.PaymentRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Payment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Payment{PaymentID: id, AccountID: body.AccountID, Counterparty: body.Counterparty, Amount: body.Amount, Currency: body.Currency, Status: body.Status, CreatedAt: existing.CreatedAt}
	updated, err := h.PaymentRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, paymentToJSON(*updated))
}

func (h *Handler) PaymentsDelete(c *gin.Context) {
	crudDelete(c, "payment_id", "Payment not found", h, func(id string) (bool, error) {
		return h.PaymentRepo.Remove(c.Request.Context(), id)
	})
}

func settlementToJSON(s domain.Settlement) gin.H {
	return gin.H{"settlement_id": s.SettlementID, "trade_id": s.TradeID, "payment_id": s.PaymentID, "status": s.Status, "settled_at": s.SettledAt}
}

func (h *Handler) SettlementsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Settlement, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.SettlementRepo.List(c.Request.Context(), limit, offset)
	}, settlementToJSON)
}

func (h *Handler) SettlementsGet(c *gin.Context) {
	crudGet(c, "settlement_id", "Settlement not found", h,
		func(id string) (*domain.Settlement, error) { return h.SettlementRepo.GetByID(c.Request.Context(), id) },
		settlementToJSON)
}

func (h *Handler) SettlementsCreate(c *gin.Context) {
	var body struct {
		TradeID   string     `json:"trade_id" binding:"required"`
		PaymentID string     `json:"payment_id" binding:"required"`
		Status    string     `json:"status"`
		SettledAt *time.Time `json:"settled_at"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Status == "" {
		body.Status = "pending"
	}
	entity := domain.Settlement{SettlementID: uuid.New().String(), TradeID: body.TradeID, PaymentID: body.PaymentID, Status: body.Status, SettledAt: body.SettledAt}
	created, err := h.SettlementRepo.Add(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, settlementToJSON(*created))
}

func (h *Handler) SettlementsCreateBatch(c *gin.Context) {
	var body []struct {
		TradeID   string     `json:"trade_id" binding:"required"`
		PaymentID string     `json:"payment_id" binding:"required"`
		Status    string     `json:"status"`
		SettledAt *time.Time `json:"settled_at"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Settlement, len(body))
	for i, b := range body {
		status := b.Status
		if status == "" {
			status = "pending"
		}
		entities[i] = domain.Settlement{SettlementID: uuid.New().String(), TradeID: b.TradeID, PaymentID: b.PaymentID, Status: status, SettledAt: b.SettledAt}
	}
	created, err := h.SettlementRepo.AddMany(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = settlementToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) SettlementsUpdate(c *gin.Context) {
	id := c.Param("settlement_id")
	var body struct {
		TradeID   string     `json:"trade_id" binding:"required"`
		PaymentID string     `json:"payment_id" binding:"required"`
		Status    string     `json:"status" binding:"required"`
		SettledAt *time.Time `json:"settled_at"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Settlement{SettlementID: id, TradeID: body.TradeID, PaymentID: body.PaymentID, Status: body.Status, SettledAt: body.SettledAt}
	updated, err := h.SettlementRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, settlementToJSON(*updated))
}

func (h *Handler) SettlementsDelete(c *gin.Context) {
	crudDelete(c, "settlement_id", "Settlement not found", h, func(id string) (bool, error) {
		return h.SettlementRepo.Remove(c.Request.Context(), id)
	})
}

func marketDataToJSON(m domain.MarketData) gin.H {
	return gin.H{"data_id": m.DataID, "instrument_id": m.InstrumentID, "timestamp": m.Timestamp, "open": m.Open, "high": m.High, "low": m.Low, "close": m.Close, "volume": m.Volume, "change_pct": m.ChangePct}
}

func (h *Handler) MarketDataList(c *gin.Context) {
	crudList(c, h, func() ([]domain.MarketData, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.MarketDataRepo.List(c.Request.Context(), limit, offset)
	}, marketDataToJSON)
}

func (h *Handler) MarketDataGet(c *gin.Context) {
	crudGet(c, "data_id", "Market data not found", h,
		func(id string) (*domain.MarketData, error) { return h.MarketDataRepo.GetByID(c.Request.Context(), id) },
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
	ts, err := time.Parse(time.RFC3339, body.Timestamp)
	if err != nil {
		ts, err = time.Parse("2006-01-02T15:04:05Z07:00", body.Timestamp)
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid timestamp format"})
		return
	}
	entity := domain.MarketData{DataID: uuid.New().String(), InstrumentID: body.InstrumentID, Timestamp: ts, Open: body.Open, High: body.High, Low: body.Low, Close: body.Close, Volume: body.Volume, ChangePct: body.ChangePct}
	created, err := h.MarketDataRepo.Add(c.Request.Context(), &entity)
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
		ts, err := time.Parse(time.RFC3339, b.Timestamp)
		if err != nil {
			ts, err = time.Parse("2006-01-02T15:04:05Z07:00", b.Timestamp)
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid timestamp format"})
			return
		}
		entities[i] = domain.MarketData{DataID: uuid.New().String(), InstrumentID: b.InstrumentID, Timestamp: ts, Open: b.Open, High: b.High, Low: b.Low, Close: b.Close, Volume: b.Volume, ChangePct: b.ChangePct}
	}
	created, err := h.MarketDataRepo.AddMany(c.Request.Context(), entities)
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
	ts, err := time.Parse(time.RFC3339, body.Timestamp)
	if err != nil {
		ts, err = time.Parse("2006-01-02T15:04:05Z07:00", body.Timestamp)
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid timestamp format"})
		return
	}
	entity := domain.MarketData{DataID: id, InstrumentID: body.InstrumentID, Timestamp: ts, Open: body.Open, High: body.High, Low: body.Low, Close: body.Close, Volume: body.Volume, ChangePct: body.ChangePct}
	updated, err := h.MarketDataRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, marketDataToJSON(*updated))
}

func (h *Handler) MarketDataDelete(c *gin.Context) {
	crudDelete(c, "data_id", "Market data not found", h, func(id string) (bool, error) {
		return h.MarketDataRepo.Remove(c.Request.Context(), id)
	})
}
