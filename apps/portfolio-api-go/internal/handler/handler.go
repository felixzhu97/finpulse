package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"finpulse/portfolio-api-go/internal/application"
)

type Handler struct {
	QuotesSvc      *application.QuotesService
	InstrumentsSvc *application.InstrumentsService
	AuthSvc        *application.AuthService
}

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *Handler) Quotes(c *gin.Context) {
	out, err := h.QuotesSvc.GetQuotes(c.Request.Context(), c.Query("symbols"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if out == nil {
		c.JSON(http.StatusOK, gin.H{})
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) Instruments(c *gin.Context) {
	limit, offset := 100, 0
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}
	if o := c.Query("offset"); o != "" {
		if n, err := strconv.Atoi(o); err == nil && n >= 0 {
			offset = n
		}
	}
	list, err := h.InstrumentsSvc.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}
