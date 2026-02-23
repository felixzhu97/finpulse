package handler

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func ProxyToPython(pythonBackendURL string) gin.HandlerFunc {
	target, err := url.Parse(pythonBackendURL)
	if err != nil || target.Host == "" {
		return func(c *gin.Context) {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Python backend not configured"})
		}
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	return func(c *gin.Context) {
		log.Printf("[proxy] %s %s -> Python", c.Request.Method, c.Request.URL.Path)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
