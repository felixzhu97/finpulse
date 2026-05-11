package handler

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

func TestParseLimitOffset(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name            string
		queryString     string
		expectedLimit  int
		expectedOffset int
	}{
		{"default values", "", 100, 0},
		{"custom limit", "?limit=50", 50, 0},
		{"custom offset", "?offset=20", 100, 20},
		{"both limit and offset", "?limit=25&offset=10", 25, 10},
		{"limit too high capped", "?limit=1000", 100, 0},
		{"limit zero not accepted", "?limit=0", 100, 0},
		{"negative limit not accepted", "?limit=-5", 100, 0},
		{"invalid limit ignored", "?limit=abc", 100, 0},
		{"negative offset not accepted", "?offset=-10", 100, 0},
		{"invalid offset ignored", "?offset=xyz", 100, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.GET("/test", func(c *gin.Context) {
				limit, offset := 100, 0
				parseLimitOffset(c, &limit, &offset)
				if limit != tt.expectedLimit || offset != tt.expectedOffset {
					t.Errorf("limit=%d, offset=%d; want limit=%d, offset=%d",
						limit, offset, tt.expectedLimit, tt.expectedOffset)
				}
				c.Status(http.StatusOK)
			})

			req := httptest.NewRequest(http.MethodGet, "/test"+tt.queryString, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
		})
	}
}

func TestRespondNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.GET("/test", func(c *gin.Context) {
		respondNotFound(c, "Resource not found")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d; want 404", w.Code)
	}
}

func TestRespondError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("not found error", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			err := application.ErrNotFound
			respondError(c, err, "Item not found")
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("status = %d; want 404", w.Code)
		}
	})

	t.Run("generic error", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			err := errors.New("database connection failed")
			respondError(c, err, "Item not found")
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("status = %d; want 500", w.Code)
		}
	})
}

func TestCrudList(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("successful list", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			testData := []string{"item1", "item2", "item3"}
			crudList(c, nil, func() ([]string, error) {
				return testData, nil
			}, func(s string) gin.H {
				return gin.H{"name": s}
			})
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("status = %d; want 200", w.Code)
		}
	})

	t.Run("list with error", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			crudList(c, nil, func() ([]string, error) {
				return nil, errors.New("database error")
			}, func(s string) gin.H {
				return gin.H{"name": s}
			})
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("status = %d; want 500", w.Code)
		}
	})
}

func TestCrudGet(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("successful get", func(t *testing.T) {
		router := gin.New()
		router.GET("/test/:id", func(c *gin.Context) {
			crudGet(c, "id", "Not found", nil, func(id string) (*string, error) {
				s := "item-" + id
				return &s, nil
			}, func(s string) gin.H {
				return gin.H{"name": s}
			})
		})

		req := httptest.NewRequest(http.MethodGet, "/test/123", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("status = %d; want 200", w.Code)
		}
	})

	t.Run("not found error", func(t *testing.T) {
		router := gin.New()
		router.GET("/test/:id", func(c *gin.Context) {
			crudGet(c, "id", "Item not found", nil, func(id string) (*string, error) {
				return nil, application.ErrNotFound
			}, func(s string) gin.H {
				return gin.H{"name": s}
			})
		})

		req := httptest.NewRequest(http.MethodGet, "/test/nonexistent", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("status = %d; want 404", w.Code)
		}
	})

	t.Run("generic error", func(t *testing.T) {
		router := gin.New()
		router.GET("/test/:id", func(c *gin.Context) {
			crudGet(c, "id", "Not found", nil, func(id string) (*string, error) {
				return nil, errors.New("database error")
			}, func(s string) gin.H {
				return gin.H{"name": s}
			})
		})

		req := httptest.NewRequest(http.MethodGet, "/test/123", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("status = %d; want 500", w.Code)
		}
	})
}

func TestCrudDelete(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("successful delete", func(t *testing.T) {
		router := gin.New()
		router.DELETE("/test/:id", func(c *gin.Context) {
			crudDelete(c, "id", "Not found", nil, func(id string) (bool, error) {
				return true, nil
			})
		})

		req := httptest.NewRequest(http.MethodDelete, "/test/123", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusNoContent {
			t.Errorf("status = %d; want 204", w.Code)
		}
	})

	t.Run("not found delete", func(t *testing.T) {
		router := gin.New()
		router.DELETE("/test/:id", func(c *gin.Context) {
			crudDelete(c, "id", "Item not found", nil, func(id string) (bool, error) {
				return false, nil
			})
		})

		req := httptest.NewRequest(http.MethodDelete, "/test/nonexistent", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("status = %d; want 404", w.Code)
		}
	})

	t.Run("delete error", func(t *testing.T) {
		router := gin.New()
		router.DELETE("/test/:id", func(c *gin.Context) {
			crudDelete(c, "id", "Not found", nil, func(id string) (bool, error) {
				return false, errors.New("database error")
			})
		})

		req := httptest.NewRequest(http.MethodDelete, "/test/123", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("status = %d; want 500", w.Code)
		}
	})
}

func TestBearerTokenHelper(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("valid bearer token", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			c.Request.Header.Set("Authorization", "Bearer mytoken123")
			token := bearerToken(c)
			if token != "mytoken123" {
				t.Errorf("bearerToken() = %q; want mytoken123", token)
			}
			c.Status(http.StatusOK)
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	})

	t.Run("missing authorization header", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			token := bearerToken(c)
			if token != "" {
				t.Errorf("bearerToken() = %q; want empty", token)
			}
			c.Status(http.StatusOK)
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	})

	t.Run("missing bearer prefix", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			c.Request.Header.Set("Authorization", "Basic sometoken")
			token := bearerToken(c)
			if token != "" {
				t.Errorf("bearerToken() = %q; want empty", token)
			}
			c.Status(http.StatusOK)
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	})

	t.Run("bearer with spaces", func(t *testing.T) {
		router := gin.New()
		router.GET("/test", func(c *gin.Context) {
			c.Request.Header.Set("Authorization", "Bearer   token123  ")
			token := bearerToken(c)
			if token != "token123" {
				t.Errorf("bearerToken() = %q; want token123", token)
			}
			c.Status(http.StatusOK)
		})

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	})
}

func TestCustomerToJSONHelper(t *testing.T) {
	email := "test@example.com"
	kycStatus := "verified"
	customer := domain.Customer{
		CustomerID: "cust-123",
		Name:       "Test Customer",
		Email:      &email,
		KYCStatus:  &kycStatus,
	}

	t.Run("without score", func(t *testing.T) {
		json := customerToJSON(customer, nil)
		if json["customer_id"] != "cust-123" {
			t.Errorf("customer_id = %v; want cust-123", json["customer_id"])
		}
	})

	t.Run("with score", func(t *testing.T) {
		score := 0.95
		json := customerToJSON(customer, &score)
		if json["ai_identity_score"] != 0.95 {
			t.Errorf("ai_identity_score = %v; want 0.95", json["ai_identity_score"])
		}
	})
}

func TestAccountToJSONHelper(t *testing.T) {
	account := domain.Account{
		AccountID:   "acc-123",
		CustomerID:  "cust-456",
		AccountType: "trading",
		Currency:    "USD",
		Status:      "active",
	}

	json := accountToJSON(account)
	if json["account_id"] != "acc-123" {
		t.Errorf("account_id = %v; want acc-123", json["account_id"])
	}
	if json["customer_id"] != "cust-456" {
		t.Errorf("customer_id = %v; want cust-456", json["customer_id"])
	}
	if json["account_type"] != "trading" {
		t.Errorf("account_type = %v; want trading", json["account_type"])
	}
}

func TestOrderToJSONHelper(t *testing.T) {
	order := domain.Order{
		OrderID:      "ord-123",
		AccountID:    "acc-456",
		InstrumentID: "inst-789",
		Side:         "buy",
		Quantity:     100,
		OrderType:    "market",
		Status:       "filled",
	}

	json := orderToJSON(order)
	if json["order_id"] != "ord-123" {
		t.Errorf("order_id = %v; want ord-123", json["order_id"])
	}
	if json["side"] != "buy" {
		t.Errorf("side = %v; want buy", json["side"])
	}
}

func TestTradeToJSONHelper(t *testing.T) {
	fee := 1.5
	trade := domain.Trade{
		TradeID: "trade-123",
		OrderID: "ord-456",
		Quantity: 50,
		Price:   150.5,
		Fee:     &fee,
	}

	json := tradeToJSON(trade)
	if json["trade_id"] != "trade-123" {
		t.Errorf("trade_id = %v; want trade-123", json["trade_id"])
	}
	if json["order_id"] != "ord-456" {
		t.Errorf("order_id = %v; want ord-456", json["order_id"])
	}
}

func TestBlockToJSONHelper(t *testing.T) {
	block := domain.Block{
		Index:          1,
		PreviousHash:   "prev-hash",
		TransactionIDs: []string{"tx1", "tx2"},
		Hash:          "block-hash",
	}

	json := blockToJSON(block)
	if json["index"] != 1 {
		t.Errorf("index = %v; want 1", json["index"])
	}
	if json["previous_hash"] != "prev-hash" {
		t.Errorf("previous_hash = %v; want prev-hash", json["previous_hash"])
	}
}

func TestTxToJSONHelper(t *testing.T) {
	tx := domain.ChainTransaction{
		TxID:              "tx-123",
		BlockIndex:        1,
		SenderAccountID:   "acc-sender",
		ReceiverAccountID: "acc-receiver",
		Amount:            100.0,
		Currency:          "SIM_COIN",
	}

	json := txToJSON(tx)
	if json["tx_id"] != "tx-123" {
		t.Errorf("tx_id = %v; want tx-123", json["tx_id"])
	}
	if json["sender_account_id"] != "acc-sender" {
		t.Errorf("sender_account_id = %v; want acc-sender", json["sender_account_id"])
	}
}
