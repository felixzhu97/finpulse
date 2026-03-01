package handler

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

func ProxyToPython(pythonBackendURL string) gin.HandlerFunc {
	return conditionalProxy(pythonBackendURL, pythonBackendURL)
}

func ProxyAnalyticsOnly(analyticsURL, fallbackURL string) gin.HandlerFunc {
	return conditionalProxy(analyticsURL, fallbackURL)
}

func conditionalProxy(analyticsURL, fallbackURL string) gin.HandlerFunc {
	analyticsTarget, _ := url.Parse(analyticsURL)
	fallbackTarget, _ := url.Parse(fallbackURL)
	analyticsProxy := maybeProxy(analyticsTarget)
	fallbackProxy := maybeProxy(fallbackTarget)
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if isAnalyticsPath(path) {
			if analyticsProxy != nil {
				log.Printf("[proxy] %s %s -> Python analytics", c.Request.Method, path)
				analyticsProxy.ServeHTTP(c.Writer, c.Request)
				return
			}
		}
		if fallbackProxy != nil {
			log.Printf("[proxy] %s %s -> Python", c.Request.Method, path)
			fallbackProxy.ServeHTTP(c.Writer, c.Request)
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"detail": "Not found"})
	}
}

func isAnalyticsPath(path string) bool {
	prefixes := []string{
		"/api/v1/risk-metrics",
		"/api/v1/analytics",
		"/api/v1/forecast",
		"/api/v1/valuations",
	}
	for _, p := range prefixes {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}

func maybeProxy(target *url.URL) *httputil.ReverseProxy {
	if target == nil || target.Host == "" {
		return nil
	}
	return httputil.NewSingleHostReverseProxy(target)
}
