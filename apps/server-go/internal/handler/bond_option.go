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

func (h *Handler) BondsList(c *gin.Context) {
	crudList(c, h, func() ([]domain.Bond, error) {
		limit, offset := 100, 0
		parseLimitOffset(c, &limit, &offset)
		return h.BondSvc.List(c.Request.Context(), limit, offset)
	}, bondToJSON)
}

func (h *Handler) BondsGet(c *gin.Context) {
	crudGet(c, "bond_id", "Bond not found", h,
		func(id string) (*domain.Bond, error) { return h.BondSvc.GetByID(c.Request.Context(), id) },
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
	created, err := h.BondSvc.Create(c.Request.Context(), &entity)
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
	created, err := h.BondSvc.CreateBatch(c.Request.Context(), entities)
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
	updated, err := h.BondSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
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
		return h.BondSvc.Delete(c.Request.Context(), id)
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
		return h.OptionSvc.List(c.Request.Context(), limit, offset)
	}, optionToJSON)
}

func (h *Handler) OptionsGet(c *gin.Context) {
	crudGet(c, "option_id", "Option not found", h,
		func(id string) (*domain.Option, error) { return h.OptionSvc.GetByID(c.Request.Context(), id) },
		optionToJSON)
}

func (h *Handler) OptionsCreate(c *gin.Context) {
	var body struct {
		InstrumentID          string   `json:"instrument_id" binding:"required"`
		UnderlyingInstrumentID string  `json:"underlying_instrument_id" binding:"required"`
		Strike                float64 `json:"strike" binding:"required"`
		Expiry                string  `json:"expiry" binding:"required"`
		OptionType            string  `json:"option_type" binding:"required"`
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
		OptionID:               uuid.New().String(),
		InstrumentID:           body.InstrumentID,
		UnderlyingInstrumentID: body.UnderlyingInstrumentID,
		Strike:                 body.Strike,
		Expiry:                 expiry,
		OptionType:             body.OptionType,
		RiskFreeRate:           body.RiskFreeRate,
		Volatility:             body.Volatility,
		BSPrice:                body.BSPrice,
		Delta:                  body.Delta,
		Gamma:                  body.Gamma,
		Theta:                  body.Theta,
		Vega:                   body.Vega,
		Rho:                    body.Rho,
		ImpliedVolatility:      body.ImpliedVolatility,
	}
	created, err := h.OptionSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, optionToJSON(*created))
}

func (h *Handler) OptionsCreateBatch(c *gin.Context) {
	var body []struct {
		InstrumentID           string   `json:"instrument_id" binding:"required"`
		UnderlyingInstrumentID string   `json:"underlying_instrument_id" binding:"required"`
		Strike                 float64  `json:"strike" binding:"required"`
		Expiry                 string   `json:"expiry" binding:"required"`
		OptionType             string   `json:"option_type" binding:"required"`
		RiskFreeRate           *float64 `json:"risk_free_rate"`
		Volatility             *float64 `json:"volatility"`
		BSPrice                *float64 `json:"bs_price"`
		Delta                  *float64 `json:"delta"`
		Gamma                  *float64 `json:"gamma"`
		Theta                  *float64 `json:"theta"`
		Vega                   *float64 `json:"vega"`
		Rho                    *float64 `json:"rho"`
		ImpliedVolatility      *float64 `json:"implied_volatility"`
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
			OptionID:               uuid.New().String(),
			InstrumentID:           b.InstrumentID,
			UnderlyingInstrumentID: b.UnderlyingInstrumentID,
			Strike:                 b.Strike,
			Expiry:                 expiry,
			OptionType:             b.OptionType,
			RiskFreeRate:           b.RiskFreeRate,
			Volatility:             b.Volatility,
			BSPrice:                b.BSPrice,
			Delta:                  b.Delta,
			Gamma:                  b.Gamma,
			Theta:                  b.Theta,
			Vega:                   b.Vega,
			Rho:                    b.Rho,
			ImpliedVolatility:      b.ImpliedVolatility,
		}
	}
	created, err := h.OptionSvc.CreateBatch(c.Request.Context(), entities)
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
		InstrumentID           string   `json:"instrument_id" binding:"required"`
		UnderlyingInstrumentID string   `json:"underlying_instrument_id" binding:"required"`
		Strike                 float64  `json:"strike" binding:"required"`
		Expiry                 string   `json:"expiry" binding:"required"`
		OptionType             string   `json:"option_type" binding:"required"`
		RiskFreeRate           *float64 `json:"risk_free_rate"`
		Volatility             *float64 `json:"volatility"`
		BSPrice                *float64 `json:"bs_price"`
		Delta                  *float64 `json:"delta"`
		Gamma                  *float64 `json:"gamma"`
		Theta                  *float64 `json:"theta"`
		Vega                   *float64 `json:"vega"`
		Rho                    *float64 `json:"rho"`
		ImpliedVolatility      *float64 `json:"implied_volatility"`
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
		OptionID:               id,
		InstrumentID:           body.InstrumentID,
		UnderlyingInstrumentID: body.UnderlyingInstrumentID,
		Strike:                 body.Strike,
		Expiry:                 expiry,
		OptionType:             body.OptionType,
		RiskFreeRate:           body.RiskFreeRate,
		Volatility:             body.Volatility,
		BSPrice:                body.BSPrice,
		Delta:                  body.Delta,
		Gamma:                  body.Gamma,
		Theta:                  body.Theta,
		Vega:                   body.Vega,
		Rho:                    body.Rho,
		ImpliedVolatility:      body.ImpliedVolatility,
	}
	updated, err := h.OptionSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
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
		return h.OptionSvc.Delete(c.Request.Context(), id)
	})
}

func optionToJSON(o domain.Option) gin.H {
	return gin.H{
		"option_id":                o.OptionID,
		"instrument_id":            o.InstrumentID,
		"underlying_instrument_id": o.UnderlyingInstrumentID,
		"strike":                   o.Strike,
		"expiry":                   o.Expiry,
		"option_type":              o.OptionType,
		"risk_free_rate":           o.RiskFreeRate,
		"volatility":               o.Volatility,
		"bs_price":                 o.BSPrice,
		"delta":                    o.Delta,
		"gamma":                    o.Gamma,
		"theta":                    o.Theta,
		"vega":                     o.Vega,
		"rho":                      o.Rho,
		"implied_volatility":       o.ImpliedVolatility,
	}
}
