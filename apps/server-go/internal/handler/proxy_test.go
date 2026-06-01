package handler

import (
	"net/url"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestProxyHelpers(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("isAnalyticsPath returns true for analytics paths", func(t *testing.T) {
		analyticsPaths := []string{
			"/api/v1/portfolio",
			"/api/v1/risk-metrics",
			"/api/v1/analytics",
			"/api/v1/analytics/portfolio",
			"/api/v1/forecast",
			"/api/v1/valuations",
		}

		for _, path := range analyticsPaths {
			if !isAnalyticsPath(path) {
				t.Errorf("isAnalyticsPath(%q) = false; want true", path)
			}
		}
	})

	t.Run("isAnalyticsPath returns false for non-analytics paths", func(t *testing.T) {
		nonAnalyticsPaths := []string{
			"/api/v1/instruments",
			"/health",
			"/api/v2/analytics",
		}

		for _, path := range nonAnalyticsPaths {
			if isAnalyticsPath(path) {
				t.Errorf("isAnalyticsPath(%q) = true; want false", path)
			}
		}
	})

	t.Run("maybeProxy returns nil for nil target", func(t *testing.T) {
		proxy := maybeProxy(nil)
		if proxy != nil {
			t.Error("maybeProxy(nil) = non-nil; want nil")
		}
	})

	t.Run("maybeProxy returns nil for empty host", func(t *testing.T) {
		proxy := maybeProxy(&url.URL{Path: "/"})
		if proxy != nil {
			t.Error("maybeProxy(empty host) = non-nil; want nil")
		}
	})

	t.Run("maybeProxy returns proxy for valid target", func(t *testing.T) {
		proxy := maybeProxy(&url.URL{Host: "localhost:8080"})
		if proxy == nil {
			t.Error("maybeProxy(valid target) = nil; want non-nil")
		}
	})
}
