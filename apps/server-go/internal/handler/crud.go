package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"finpulse/server-go/internal/domain"
)

func (h *Handler) CustomersList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.CustomerRepo.List(c.Request.Context(), limit, offset)
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
	entity, err := h.CustomerRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	created, err := h.CustomerRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.CustomerRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.CustomerRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	updated, err := h.CustomerRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, customerToJSON(*updated, nil))
}

func (h *Handler) CustomersDelete(c *gin.Context) {
	id := c.Param("customer_id")
	ok, err := h.CustomerRepo.Remove(c.Request.Context(), id)
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

func parseLimitOffset(c *gin.Context, limit, offset *int) {
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n >= 1 && n <= 500 {
			*limit = n
		}
	}
	if o := c.Query("offset"); o != "" {
		if n, err := strconv.Atoi(o); err == nil && n >= 0 {
			*offset = n
		}
	}
}

func (h *Handler) AccountsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.AccountRepo.List(c.Request.Context(), limit, offset)
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
	entity, err := h.AccountRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	created, err := h.AccountRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.AccountRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.AccountRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	updated, err := h.AccountRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, accountToJSON(*updated))
}

func (h *Handler) AccountsDelete(c *gin.Context) {
	id := c.Param("account_id")
	ok, err := h.AccountRepo.Remove(c.Request.Context(), id)
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

func (h *Handler) WatchlistsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.WatchlistRepo.List(c.Request.Context(), limit, offset)
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
	entity, err := h.WatchlistRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	created, err := h.WatchlistRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.WatchlistRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.WatchlistRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	updated, err := h.WatchlistRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watchlistToJSON(*updated))
}

func (h *Handler) WatchlistsDelete(c *gin.Context) {
	id := c.Param("watchlist_id")
	ok, err := h.WatchlistRepo.Remove(c.Request.Context(), id)
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
	list, err := h.WatchlistItemRepo.List(c.Request.Context(), limit, offset)
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
	entity, err := h.WatchlistItemRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	created, err := h.WatchlistItemRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.WatchlistItemRepo.AddMany(c.Request.Context(), entities)
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
	existing, err := h.WatchlistItemRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	updated, err := h.WatchlistItemRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watchlistItemToJSON(*updated))
}

func (h *Handler) WatchlistItemsDelete(c *gin.Context) {
	id := c.Param("watchlist_item_id")
	ok, err := h.WatchlistItemRepo.Remove(c.Request.Context(), id)
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
