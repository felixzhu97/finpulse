package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"finpulse/server-go/internal/application"
)

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

func respondNotFound(c *gin.Context, detail string) {
	c.JSON(http.StatusNotFound, gin.H{"detail": detail})
}

func respondError(c *gin.Context, err error, notFoundMsg string) {
	if errors.Is(err, application.ErrNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"detail": notFoundMsg})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
}

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
		if errors.Is(err, application.ErrNotFound) {
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
