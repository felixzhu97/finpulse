package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
	"finpulse/server-go/internal/handler"

	"github.com/gin-gonic/gin"
)

type mockQuoteRepo struct {
	quotes []domain.Quote
}

func (m *mockQuoteRepo) GetBySymbols(ctx context.Context, symbols []string) ([]domain.Quote, error) {
	return m.quotes, nil
}

type mockInstrumentRepo struct {
	instruments []domain.Instrument
}

func (m *mockInstrumentRepo) List(ctx context.Context, limit, offset int) ([]domain.Instrument, error) {
	return m.instruments, nil
}

func (m *mockInstrumentRepo) GetByID(ctx context.Context, instrumentID string) (*domain.Instrument, error) {
	return nil, nil
}

func (m *mockInstrumentRepo) Add(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	return i, nil
}

func (m *mockInstrumentRepo) AddMany(ctx context.Context, entities []domain.Instrument) ([]domain.Instrument, error) {
	return entities, nil
}

func (m *mockInstrumentRepo) Save(ctx context.Context, i *domain.Instrument) (*domain.Instrument, error) {
	return i, nil
}

func (m *mockInstrumentRepo) Remove(ctx context.Context, instrumentID string) (bool, error) {
	return true, nil
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	q := &mockQuoteRepo{quotes: []domain.Quote{
		{Symbol: "AAPL", Price: 150.5, Change: 1.2, ChangeRate: 0.8, Timestamp: 0},
	}}
	inst := &mockInstrumentRepo{instruments: []domain.Instrument{
		{InstrumentID: "id1", Symbol: "AAPL", Name: strPtr("Apple Inc."), AssetClass: strPtr("equity"), Currency: strPtr("USD"), Exchange: strPtr("NASDAQ")},
	}}
	h := &handler.Handler{
		QuotesSvc:      application.NewQuotesService(q),
		InstrumentsSvc: application.NewInstrumentsService(inst),
		InstrumentRepo: inst,
	}
	r := gin.New()
	r.Use(gin.Recovery(), cors())
	r.GET("/health", h.Health)
	r.GET("/api/v1/quotes", h.Quotes)
	r.GET("/api/v1/instruments", h.InstrumentsList)
	return r
}

func strPtr(s string) *string { return &s }

func TestHealth(t *testing.T) {
	r := setupRouter()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("health status = %d; want 200", w.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["status"] != "ok" {
		t.Errorf("health status = %q; want ok", body["status"])
	}
}

func TestQuotes(t *testing.T) {
	r := setupRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/quotes?symbols=AAPL", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("quotes status = %d; want 200", w.Code)
	}
	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if _, ok := body["AAPL"]; !ok {
		t.Errorf("quotes body missing AAPL: %v", body)
	}
}

func TestQuotesEmpty(t *testing.T) {
	r := setupRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/quotes", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("quotes empty status = %d; want 200", w.Code)
	}
	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if len(body) != 0 {
		t.Errorf("quotes empty body = %v; want {}", body)
	}
}

func TestInstruments(t *testing.T) {
	r := setupRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/instruments", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("instruments status = %d; want 200", w.Code)
	}
	var body []map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if len(body) != 1 {
		t.Errorf("instruments len = %d; want 1", len(body))
	}
	if body[0]["symbol"] != "AAPL" {
		t.Errorf("instruments[0].symbol = %v; want AAPL", body[0]["symbol"])
	}
}
