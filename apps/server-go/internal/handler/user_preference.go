package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func (h *Handler) UserPreferencesList(c *gin.Context) {
	limit, offset := 100, 0
	parseLimitOffset(c, &limit, &offset)
	list, err := h.UserPreferenceSvc.List(c.Request.Context(), limit, offset)
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
	entity, err := h.UserPreferenceSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
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
		CustomerID          string  `json:"customer_id" binding:"required"`
		Theme               *string `json:"theme"`
		Language            *string `json:"language"`
		NotificationsEnabled bool   `json:"notifications_enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	entity := domain.UserPreference{
		PreferenceID:         uuid.New().String(),
		CustomerID:           body.CustomerID,
		Theme:                body.Theme,
		Language:             body.Language,
		NotificationsEnabled: body.NotificationsEnabled,
	}
	created, err := h.UserPreferenceSvc.Create(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, userPreferenceToJSON(*created))
}

func (h *Handler) UserPreferencesCreateBatch(c *gin.Context) {
	var body []struct {
		CustomerID           string  `json:"customer_id" binding:"required"`
		Theme                *string `json:"theme"`
		Language             *string `json:"language"`
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
	created, err := h.UserPreferenceSvc.CreateBatch(c.Request.Context(), entities)
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
		CustomerID           string  `json:"customer_id" binding:"required"`
		Theme                *string `json:"theme"`
		Language             *string `json:"language"`
		NotificationsEnabled bool   `json:"notifications_enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	existing, err := h.UserPreferenceSvc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
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
	updated, err := h.UserPreferenceSvc.Update(c.Request.Context(), &entity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userPreferenceToJSON(*updated))
}

func (h *Handler) UserPreferencesDelete(c *gin.Context) {
	id := c.Param("preference_id")
	ok, err := h.UserPreferenceSvc.Delete(c.Request.Context(), id)
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
		"preference_id":         u.PreferenceID,
		"customer_id":           u.CustomerID,
		"theme":                 u.Theme,
		"language":              u.Language,
		"notifications_enabled": u.NotificationsEnabled,
		"updated_at":            u.UpdatedAt,
	}
}
