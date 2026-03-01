package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func (h *Handler) CustomersList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.CustomerSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = customerToJSON(e, nil)
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) CustomersGet(c *gin.Context) {
	id := c.Param("customer_id")
	entity, err := h.CustomerSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Customer not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, customerToJSON(*entity, nil))
}

func (h *Handler) CustomersCreate(c *gin.Context) {
	var body struct {
		Name      string  `json:"name" binding:"required"`
		Email     *string `json:"email"`
		KYCStatus *string `json:"kyc_status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Customer{
		CustomerID: uuid.New().String(),
		Name:       body.Name,
		Email:      body.Email,
		KYCStatus:  body.KYCStatus,
	}
	created, err := h.CustomerSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	var score *float64
	if result := domain.ScoreIdentity("profile", body.Name, "", ""); result.IdentityScore > 0 {
		s := result.IdentityScore
		score = &s
	}
	c.JSON(http.StatusCreated, customerToJSON(*created, score))
}

func (h *Handler) CustomersCreateBatch(c *gin.Context) {
	var body []struct {
		Name      string  `json:"name" binding:"required"`
		Email     *string `json:"email"`
		KYCStatus *string `json:"kyc_status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Customer, len(body))
	for i, b := range body {
		entities[i] = domain.Customer{
			CustomerID: uuid.New().String(),
			Name:       b.Name,
			Email:      b.Email,
			KYCStatus:  b.KYCStatus,
		}
	}
	created, err := h.CustomerSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = customerToJSON(e, nil)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) CustomersUpdate(c *gin.Context) {
	id := c.Param("customer_id")
	var body struct {
		Name      string  `json:"name" binding:"required"`
		Email     *string `json:"email"`
		KYCStatus *string `json:"kyc_status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.CustomerSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Customer not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Customer{
		CustomerID: id,
		Name:       body.Name,
		Email:      body.Email,
		KYCStatus:  body.KYCStatus,
		CreatedAt:  existing.CreatedAt,
	}
	updated, err := h.CustomerSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, customerToJSON(*updated, nil))
}

func (h *Handler) CustomersDelete(c *gin.Context) {
	id := c.Param("customer_id")
	ok, err := h.CustomerSvc.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Customer not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func customerToJSON(c domain.Customer, aiScore *float64) gin.H {
	h := gin.H{
		"customer_id": c.CustomerID,
		"name":        c.Name,
		"email":       c.Email,
		"kyc_status":  c.KYCStatus,
		"created_at":  c.CreatedAt,
	}
	if aiScore != nil {
		h["ai_identity_score"] = *aiScore
	}
	return h
}

func (h *Handler) AccountsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.AccountSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = accountToJSON(e)
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) AccountsGet(c *gin.Context) {
	id := c.Param("account_id")
	entity, err := h.AccountSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Account not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, accountToJSON(*entity))
}

func (h *Handler) AccountsCreate(c *gin.Context) {
	var body struct {
		CustomerID  string `json:"customer_id" binding:"required"`
		AccountType string `json:"account_type" binding:"required"`
		Currency    string `json:"currency" binding:"required"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Status == "" {
		body.Status = "active"
	}
	entity := domain.Account{
		AccountID:   uuid.New().String(),
		CustomerID:  body.CustomerID,
		AccountType: body.AccountType,
		Currency:    body.Currency,
		Status:      body.Status,
	}
	created, err := h.AccountSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, accountToJSON(*created))
}

func (h *Handler) AccountsCreateBatch(c *gin.Context) {
	var body []struct {
		CustomerID  string `json:"customer_id" binding:"required"`
		AccountType string `json:"account_type" binding:"required"`
		Currency    string `json:"currency" binding:"required"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Account, len(body))
	for i, b := range body {
		status := b.Status
		if status == "" {
			status = "active"
		}
		entities[i] = domain.Account{
			AccountID:   uuid.New().String(),
			CustomerID:  b.CustomerID,
			AccountType: b.AccountType,
			Currency:    b.Currency,
			Status:      status,
		}
	}
	created, err := h.AccountSvc.CreateBatch(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = accountToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) AccountsUpdate(c *gin.Context) {
	id := c.Param("account_id")
	var body struct {
		CustomerID  string `json:"customer_id" binding:"required"`
		AccountType string `json:"account_type" binding:"required"`
		Currency    string `json:"currency" binding:"required"`
		Status      string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.AccountSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Account not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Account{
		AccountID:   id,
		CustomerID:  body.CustomerID,
		AccountType: body.AccountType,
		Currency:    body.Currency,
		Status:      body.Status,
		OpenedAt:    existing.OpenedAt,
	}
	updated, err := h.AccountSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, accountToJSON(*updated))
}

func (h *Handler) AccountsDelete(c *gin.Context) {
	id := c.Param("account_id")
	ok, err := h.AccountSvc.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Account not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func accountToJSON(a domain.Account) gin.H {
	return gin.H{
		"account_id":   a.AccountID,
		"customer_id":  a.CustomerID,
		"account_type": a.AccountType,
		"currency":     a.Currency,
		"status":       a.Status,
		"opened_at":    a.OpenedAt,
	}
}
