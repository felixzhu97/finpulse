package handler

import (
	"errors"
	"net/http"
	"strings"

	"finpulse/portfolio-api-go/internal/application"
	"finpulse/portfolio-api-go/internal/domain"

	"github.com/gin-gonic/gin"
)

func (h *Handler) AuthLogin(c *gin.Context) {
	var req domain.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}
	resp, err := h.AuthSvc.Login(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, application.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"detail": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) AuthRegister(c *gin.Context) {
	var req domain.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}
	resp, err := h.AuthSvc.Register(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, application.ErrEmailAlreadyRegistered) {
			c.JSON(http.StatusBadRequest, gin.H{"detail": "Email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) AuthMe(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Missing or invalid authorization"})
		return
	}
	customer, err := h.AuthSvc.GetCustomerByToken(c.Request.Context(), token)
	if err != nil || customer == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Invalid or expired session"})
		return
	}
	c.JSON(http.StatusOK, customer)
}

func (h *Handler) AuthLogout(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Missing or invalid authorization"})
		return
	}
	_ = h.AuthSvc.Logout(c.Request.Context(), token)
	c.Status(http.StatusNoContent)
}

func (h *Handler) AuthChangePassword(c *gin.Context) {
	token := bearerToken(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Missing or invalid authorization"})
		return
	}
	customer, err := h.AuthSvc.GetCustomerByToken(c.Request.Context(), token)
	if err != nil || customer == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Invalid or expired session"})
		return
	}
	var req domain.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}
	err = h.AuthSvc.ChangePassword(c.Request.Context(), customer.CustomerID, req)
	if err != nil {
		if errors.Is(err, application.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"detail": "Current password is incorrect"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func bearerToken(c *gin.Context) string {
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(auth[7:])
}
