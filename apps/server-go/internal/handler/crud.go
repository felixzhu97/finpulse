package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

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

func (h *Handler) InstrumentsList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.InstrumentRepo.List(c.Request.Context(), limit, offset)
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
	entity, err := h.InstrumentRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	created, err := h.InstrumentRepo.Add(c.Request.Context(), &entity)
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
	created, err := h.InstrumentRepo.AddMany(c.Request.Context(), entities)
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
	updated, err := h.InstrumentRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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
	ok, err := h.InstrumentRepo.Remove(c.Request.Context(), id)
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

func (h *Handler) BondsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Bond, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.BondRepo.List(c.Request.Context(), limit, offset)
	}, bondToJSON)
}

func (h *Handler) BondsGet(c *gin.Context) {
	crudGet(c, "bond_id", "Bond not found", h,
		func(id string) (*domain.Bond, error) { return h.BondRepo.GetByID(c.Request.Context(), id) },
		bondToJSON)
}

func (h *Handler) BondsCreate(c *gin.Context) {
	var body struct {
		InstrumentID  string   `json:"instrument_id" binding:"required"`
		FaceValue     *float64 `json:"face_value"`
		CouponRate    *float64 `json:"coupon_rate"`
		YTM           *float64 `json:"ytm"`
		Duration      *float64 `json:"duration"`
		Convexity     *float64 `json:"convexity"`
		MaturityYears *float64 `json:"maturity_years"`
		Frequency     *int     `json:"frequency"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Bond{
		BondID:        uuid.New().String(),
		InstrumentID:  body.InstrumentID,
		FaceValue:     body.FaceValue,
		CouponRate:    body.CouponRate,
		YTM:           body.YTM,
		Duration:      body.Duration,
		Convexity:     body.Convexity,
		MaturityYears: body.MaturityYears,
		Frequency:     body.Frequency,
	}
	created, err := h.BondRepo.Add(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bondToJSON(*created))
}

func (h *Handler) BondsCreateBatch(c *gin.Context) {
	var body []struct {
		InstrumentID  string   `json:"instrument_id" binding:"required"`
		FaceValue     *float64 `json:"face_value"`
		CouponRate    *float64 `json:"coupon_rate"`
		YTM           *float64 `json:"ytm"`
		Duration      *float64 `json:"duration"`
		Convexity     *float64 `json:"convexity"`
		MaturityYears *float64 `json:"maturity_years"`
		Frequency     *int     `json:"frequency"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Bond, len(body))
	for i, b := range body {
		entities[i] = domain.Bond{
			BondID:        uuid.New().String(),
			InstrumentID:  b.InstrumentID,
			FaceValue:     b.FaceValue,
			CouponRate:    b.CouponRate,
			YTM:           b.YTM,
			Duration:      b.Duration,
			Convexity:     b.Convexity,
			MaturityYears: b.MaturityYears,
			Frequency:     b.Frequency,
		}
	}
	created, err := h.BondRepo.AddMany(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = bondToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) BondsUpdate(c *gin.Context) {
	id := c.Param("bond_id")
	var body struct {
		InstrumentID  string   `json:"instrument_id" binding:"required"`
		FaceValue     *float64 `json:"face_value"`
		CouponRate    *float64 `json:"coupon_rate"`
		YTM           *float64 `json:"ytm"`
		Duration      *float64 `json:"duration"`
		Convexity     *float64 `json:"convexity"`
		MaturityYears *float64 `json:"maturity_years"`
		Frequency     *int     `json:"frequency"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.Bond{
		BondID:        id,
		InstrumentID:  body.InstrumentID,
		FaceValue:     body.FaceValue,
		CouponRate:    body.CouponRate,
		YTM:           body.YTM,
		Duration:      body.Duration,
		Convexity:     body.Convexity,
		MaturityYears: body.MaturityYears,
		Frequency:     body.Frequency,
	}
	updated, err := h.BondRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Bond not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bondToJSON(*updated))
}

func (h *Handler) BondsDelete(c *gin.Context) {
	crudDelete(c, "bond_id", "Bond not found", h, func(id string) (bool, error) {
		return h.BondRepo.Remove(c.Request.Context(), id)
	})
}

func bondToJSON(b domain.Bond) gin.H {
	return gin.H{
		"bond_id":        b.BondID,
		"instrument_id":  b.InstrumentID,
		"face_value":     b.FaceValue,
		"coupon_rate":    b.CouponRate,
		"ytm":            b.YTM,
		"duration":       b.Duration,
		"convexity":      b.Convexity,
		"maturity_years": b.MaturityYears,
		"frequency":      b.Frequency,
	}
}

func (h *Handler) OptionsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Option, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.OptionRepo.List(c.Request.Context(), limit, offset)
	}, optionToJSON)
}

func (h *Handler) OptionsGet(c *gin.Context) {
	crudGet(c, "option_id", "Option not found", h,
		func(id string) (*domain.Option, error) { return h.OptionRepo.GetByID(c.Request.Context(), id) },
		optionToJSON)
}

func (h *Handler) OptionsCreate(c *gin.Context) {
	var body struct {
		InstrumentID          string    `json:"instrument_id" binding:"required"`
		UnderlyingInstrumentID string   `json:"underlying_instrument_id" binding:"required"`
		Strike                float64   `json:"strike" binding:"required"`
		Expiry                string    `json:"expiry" binding:"required"`
		OptionType            string    `json:"option_type" binding:"required"`
		RiskFreeRate          *float64  `json:"risk_free_rate"`
		Volatility            *float64  `json:"volatility"`
		BSPrice               *float64  `json:"bs_price"`
		Delta                 *float64  `json:"delta"`
		Gamma                 *float64  `json:"gamma"`
		Theta                 *float64  `json:"theta"`
		Vega                  *float64  `json:"vega"`
		Rho                   *float64  `json:"rho"`
		ImpliedVolatility     *float64  `json:"implied_volatility"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	expiry, err := time.Parse(time.RFC3339, body.Expiry)
	if err != nil {
		expiry, err = time.Parse("2006-01-02T15:04:05Z07:00", body.Expiry)
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid expiry format"})
		return
	}
	entity := domain.Option{
		OptionID:              uuid.New().String(),
		InstrumentID:          body.InstrumentID,
		UnderlyingInstrumentID: body.UnderlyingInstrumentID,
		Strike:                body.Strike,
		Expiry:                expiry,
		OptionType:            body.OptionType,
		RiskFreeRate:          body.RiskFreeRate,
		Volatility:            body.Volatility,
		BSPrice:               body.BSPrice,
		Delta:                 body.Delta,
		Gamma:                 body.Gamma,
		Theta:                 body.Theta,
		Vega:                  body.Vega,
		Rho:                   body.Rho,
		ImpliedVolatility:     body.ImpliedVolatility,
	}
	created, err := h.OptionRepo.Add(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, optionToJSON(*created))
}

func (h *Handler) OptionsCreateBatch(c *gin.Context) {
	var body []struct {
		InstrumentID          string   `json:"instrument_id" binding:"required"`
		UnderlyingInstrumentID string  `json:"underlying_instrument_id" binding:"required"`
		Strike                float64  `json:"strike" binding:"required"`
		Expiry                string   `json:"expiry" binding:"required"`
		OptionType            string   `json:"option_type" binding:"required"`
		RiskFreeRate          *float64 `json:"risk_free_rate"`
		Volatility            *float64 `json:"volatility"`
		BSPrice               *float64 `json:"bs_price"`
		Delta                 *float64 `json:"delta"`
		Gamma                 *float64 `json:"gamma"`
		Theta                 *float64 `json:"theta"`
		Vega                  *float64 `json:"vega"`
		Rho                   *float64 `json:"rho"`
		ImpliedVolatility     *float64 `json:"implied_volatility"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.Option, len(body))
	for i, b := range body {
		expiry, err := time.Parse(time.RFC3339, b.Expiry)
		if err != nil {
			expiry, err = time.Parse("2006-01-02T15:04:05Z07:00", b.Expiry)
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid expiry format"})
			return
		}
		entities[i] = domain.Option{
			OptionID:              uuid.New().String(),
			InstrumentID:          b.InstrumentID,
			UnderlyingInstrumentID: b.UnderlyingInstrumentID,
			Strike:                b.Strike,
			Expiry:                expiry,
			OptionType:            b.OptionType,
			RiskFreeRate:          b.RiskFreeRate,
			Volatility:            b.Volatility,
			BSPrice:               b.BSPrice,
			Delta:                 b.Delta,
			Gamma:                 b.Gamma,
			Theta:                 b.Theta,
			Vega:                  b.Vega,
			Rho:                   b.Rho,
			ImpliedVolatility:     b.ImpliedVolatility,
		}
	}
	created, err := h.OptionRepo.AddMany(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = optionToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) OptionsUpdate(c *gin.Context) {
	id := c.Param("option_id")
	var body struct {
		InstrumentID          string   `json:"instrument_id" binding:"required"`
		UnderlyingInstrumentID string  `json:"underlying_instrument_id" binding:"required"`
		Strike                float64  `json:"strike" binding:"required"`
		Expiry                string   `json:"expiry" binding:"required"`
		OptionType            string   `json:"option_type" binding:"required"`
		RiskFreeRate          *float64 `json:"risk_free_rate"`
		Volatility            *float64 `json:"volatility"`
		BSPrice               *float64 `json:"bs_price"`
		Delta                 *float64 `json:"delta"`
		Gamma                 *float64 `json:"gamma"`
		Theta                 *float64 `json:"theta"`
		Vega                  *float64 `json:"vega"`
		Rho                   *float64 `json:"rho"`
		ImpliedVolatility     *float64 `json:"implied_volatility"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	expiry, err := time.Parse(time.RFC3339, body.Expiry)
	if err != nil {
		expiry, err = time.Parse("2006-01-02T15:04:05Z07:00", body.Expiry)
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid expiry format"})
		return
	}
	entity := domain.Option{
		OptionID:              id,
		InstrumentID:          body.InstrumentID,
		UnderlyingInstrumentID: body.UnderlyingInstrumentID,
		Strike:                body.Strike,
		Expiry:                expiry,
		OptionType:            body.OptionType,
		RiskFreeRate:          body.RiskFreeRate,
		Volatility:            body.Volatility,
		BSPrice:               body.BSPrice,
		Delta:                 body.Delta,
		Gamma:                 body.Gamma,
		Theta:                 body.Theta,
		Vega:                  body.Vega,
		Rho:                   body.Rho,
		ImpliedVolatility:     body.ImpliedVolatility,
	}
	updated, err := h.OptionRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Option not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, optionToJSON(*updated))
}

func (h *Handler) OptionsDelete(c *gin.Context) {
	crudDelete(c, "option_id", "Option not found", h, func(id string) (bool, error) {
		return h.OptionRepo.Remove(c.Request.Context(), id)
	})
}

func optionToJSON(o domain.Option) gin.H {
	return gin.H{
		"option_id":               o.OptionID,
		"instrument_id":           o.InstrumentID,
		"underlying_instrument_id": o.UnderlyingInstrumentID,
		"strike":                  o.Strike,
		"expiry":                  o.Expiry,
		"option_type":             o.OptionType,
		"risk_free_rate":          o.RiskFreeRate,
		"volatility":              o.Volatility,
		"bs_price":                o.BSPrice,
		"delta":                   o.Delta,
		"gamma":                   o.Gamma,
		"theta":                   o.Theta,
		"vega":                    o.Vega,
		"rho":                     o.Rho,
		"implied_volatility":      o.ImpliedVolatility,
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

func (h *Handler) UserPreferencesList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.UserPreferenceRepo.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(list))
	for i, e := range list {
		out[i] = userPreferenceToJSON(e)
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) UserPreferencesGet(c *gin.Context) {
	id := c.Param("preference_id")
	entity, err := h.UserPreferenceRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "User preference not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userPreferenceToJSON(*entity))
}

func (h *Handler) UserPreferencesCreate(c *gin.Context) {
	var body struct {
		CustomerID          string `json:"customer_id" binding:"required"`
		Theme               *string `json:"theme"`
		Language            *string `json:"language"`
		NotificationsEnabled bool   `json:"notifications_enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.UserPreference{
		PreferenceID:        uuid.New().String(),
		CustomerID:          body.CustomerID,
		Theme:               body.Theme,
		Language:            body.Language,
		NotificationsEnabled: body.NotificationsEnabled,
	}
	created, err := h.UserPreferenceRepo.Add(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, userPreferenceToJSON(*created))
}

func (h *Handler) UserPreferencesCreateBatch(c *gin.Context) {
	var body []struct {
		CustomerID          string  `json:"customer_id" binding:"required"`
		Theme               *string `json:"theme"`
		Language            *string `json:"language"`
		NotificationsEnabled bool   `json:"notifications_enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entities := make([]domain.UserPreference, len(body))
	for i, b := range body {
		entities[i] = domain.UserPreference{
			PreferenceID:         uuid.New().String(),
			CustomerID:           b.CustomerID,
			Theme:                b.Theme,
			Language:             b.Language,
			NotificationsEnabled: b.NotificationsEnabled,
		}
	}
	created, err := h.UserPreferenceRepo.AddMany(c.Request.Context(), entities)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	out := make([]gin.H, len(created))
	for i, e := range created {
		out[i] = userPreferenceToJSON(e)
	}
	c.JSON(http.StatusCreated, out)
}

func (h *Handler) UserPreferencesUpdate(c *gin.Context) {
	id := c.Param("preference_id")
	var body struct {
		CustomerID          string  `json:"customer_id" binding:"required"`
		Theme               *string `json:"theme"`
		Language            *string `json:"language"`
		NotificationsEnabled bool   `json:"notifications_enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.UserPreferenceRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "User preference not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.UserPreference{
		PreferenceID:         id,
		CustomerID:           body.CustomerID,
		Theme:                body.Theme,
		Language:             body.Language,
		NotificationsEnabled: body.NotificationsEnabled,
		UpdatedAt:            existing.UpdatedAt,
	}
	updated, err := h.UserPreferenceRepo.Save(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userPreferenceToJSON(*updated))
}

func (h *Handler) UserPreferencesDelete(c *gin.Context) {
	id := c.Param("preference_id")
	ok, err := h.UserPreferenceRepo.Remove(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"detail": "User preference not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func userPreferenceToJSON(u domain.UserPreference) gin.H {
	return gin.H{
		"preference_id":        u.PreferenceID,
		"customer_id":          u.CustomerID,
		"theme":                u.Theme,
		"language":             u.Language,
		"notifications_enabled": u.NotificationsEnabled,
		"updated_at":           u.UpdatedAt,
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
