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

func cashTransactionToJSON(c domain.CashTransaction) gin.H {
	return gin.H{"transaction_id": c.TransactionID, "account_id": c.AccountID, "type": c.Type, "amount": c.Amount, "currency": c.Currency, "status": c.Status, "created_at": c.CreatedAt}
}

func (h *Handler) CashTransactionsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.CashTransaction, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.CashTransactionSvc.List(c.Request.Context(), limit, offset)
	}, cashTransactionToJSON)
}

func (h *Handler) CashTransactionsGet(c *gin.Context) {
	crudGet(c, "transaction_id", "Cash transaction not found", h,
		func(id string) (*domain.CashTransaction, error) { return h.CashTransactionSvc.GetByID(c.Request.Context(), id) },
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
	created, err := h.CashTransactionSvc.Create(c.Request.Context(), &entity)
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
	created, err := h.CashTransactionSvc.CreateBatch(c.Request.Context(), entities)
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
	existing, err := h.CashTransactionSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Cash transaction not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.CashTransaction{TransactionID: id, AccountID: body.AccountID, Type: body.Type, Amount: body.Amount, Currency: body.Currency, Status: body.Status, CreatedAt: existing.CreatedAt}
	updated, err := h.CashTransactionSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, cashTransactionToJSON(*updated))
}

func (h *Handler) CashTransactionsDelete(c *gin.Context) {
	crudDelete(c, "transaction_id", "Cash transaction not found", h, func(id string) (bool, error) {
		return h.CashTransactionSvc.Delete(c.Request.Context(), id)
	})
}

func paymentToJSON(p domain.Payment) gin.H {
	return gin.H{"payment_id": p.PaymentID, "account_id": p.AccountID, "counterparty": p.Counterparty, "amount": p.Amount, "currency": p.Currency, "status": p.Status, "created_at": p.CreatedAt}
}

func (h *Handler) PaymentsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Payment, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.PaymentSvc.List(c.Request.Context(), limit, offset)
	}, paymentToJSON)
}

func (h *Handler) PaymentsGet(c *gin.Context) {
	crudGet(c, "payment_id", "Payment not found", h,
		func(id string) (*domain.Payment, error) { return h.PaymentSvc.GetByID(c.Request.Context(), id) },
		paymentToJSON)
}

func (h *Handler) PaymentsCreate(c *gin.Context) {
	var body struct {
		AccountID    string   `json:"account_id" binding:"required"`
		Counterparty *string  `json:"counterparty"`
		Amount       float64  `json:"amount" binding:"required"`
		Currency     string   `json:"currency" binding:"required"`
		Status       string   `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Status == "" {
		body.Status = "pending"
	}
	entity := domain.Payment{PaymentID: uuid.New().String(), AccountID: body.AccountID, Counterparty: body.Counterparty, Amount: body.Amount, Currency: body.Currency, Status: body.Status}
	created, err := h.PaymentSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, paymentToJSON(*created))
}

func (h *Handler) PaymentsCreateBatch(c *gin.Context) {
	var body []struct {
		AccountID    string   `json:"account_id" binding:"required"`
		Counterparty *string  `json:"counterparty"`
		Amount       float64  `json:"amount" binding:"required"`
		Currency     string   `json:"currency" binding:"required"`
		Status       string   `json:"status"`
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
	created, err := h.PaymentSvc.CreateBatch(c.Request.Context(), entities)
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
		AccountID    string   `json:"account_id" binding:"required"`
		Counterparty *string  `json:"counterparty"`
		Amount       float64  `json:"amount" binding:"required"`
		Currency     string   `json:"currency" binding:"required"`
		Status       string   `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.PaymentSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Payment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Payment{PaymentID: id, AccountID: body.AccountID, Counterparty: body.Counterparty, Amount: body.Amount, Currency: body.Currency, Status: body.Status, CreatedAt: existing.CreatedAt}
	updated, err := h.PaymentSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, paymentToJSON(*updated))
}

func (h *Handler) PaymentsDelete(c *gin.Context) {
	crudDelete(c, "payment_id", "Payment not found", h, func(id string) (bool, error) {
		return h.PaymentSvc.Delete(c.Request.Context(), id)
	})
}

func settlementToJSON(s domain.Settlement) gin.H {
	return gin.H{"settlement_id": s.SettlementID, "trade_id": s.TradeID, "payment_id": s.PaymentID, "status": s.Status, "settled_at": s.SettledAt}
}

func (h *Handler) SettlementsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Settlement, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.SettlementSvc.List(c.Request.Context(), limit, offset)
	}, settlementToJSON)
}

func (h *Handler) SettlementsGet(c *gin.Context) {
	crudGet(c, "settlement_id", "Settlement not found", h,
		func(id string) (*domain.Settlement, error) { return h.SettlementSvc.GetByID(c.Request.Context(), id) },
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
	created, err := h.SettlementSvc.Create(c.Request.Context(), &entity)
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
	created, err := h.SettlementSvc.CreateBatch(c.Request.Context(), entities)
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
	updated, err := h.SettlementSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, settlementToJSON(*updated))
}

func (h *Handler) SettlementsDelete(c *gin.Context) {
	crudDelete(c, "settlement_id", "Settlement not found", h, func(id string) (bool, error) {
		return h.SettlementSvc.Delete(c.Request.Context(), id)
	})
}
