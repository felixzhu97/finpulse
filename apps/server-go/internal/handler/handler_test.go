package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"

	"github.com/gin-gonic/gin"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	return r
}

func ts() time.Time { return time.Unix(1234567890, 0) }

func TestHealth(t *testing.T) {
	r := setupTestRouter()
	h := &Handler{}
	r.GET("/health", h.Health)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d; want 200", w.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["status"] != "ok" {
		t.Errorf("status = %q; want ok", body["status"])
	}
}

func TestBearerToken(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("valid bearer token", func(t *testing.T) {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
		c.Request.Header.Set("Authorization", "Bearer mytoken123")

		token := bearerToken(c)
		if token != "mytoken123" {
			t.Errorf("bearerToken() = %q; want mytoken123", token)
		}
	})

	t.Run("missing authorization header", func(t *testing.T) {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest(http.MethodGet, "/", nil)

		token := bearerToken(c)
		if token != "" {
			t.Errorf("bearerToken() = %q; want empty", token)
		}
	})

	t.Run("missing bearer prefix", func(t *testing.T) {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
		c.Request.Header.Set("Authorization", "Basic sometoken")

		token := bearerToken(c)
		if token != "" {
			t.Errorf("bearerToken() = %q; want empty", token)
		}
	})

	t.Run("bearer with spaces", func(t *testing.T) {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
		c.Request.Header.Set("Authorization", "Bearer   token123  ")

		token := bearerToken(c)
		if token != "token123" {
			t.Errorf("bearerToken() = %q; want token123", token)
		}
	})
}

func TestInstrumentToJSON(t *testing.T) {
	name := "Apple Inc."
	assetClass := "equity"
	currency := "USD"
	exchange := "NASDAQ"

	inst := domain.Instrument{
		InstrumentID: "inst-123",
		Symbol:       "AAPL",
		Name:         &name,
		AssetClass:   &assetClass,
		Currency:     &currency,
		Exchange:     &exchange,
	}

	json := instrumentToJSON(inst)

	if json["instrument_id"] != "inst-123" {
		t.Errorf("instrument_id = %v; want inst-123", json["instrument_id"])
	}
	if json["symbol"] != "AAPL" {
		t.Errorf("symbol = %v; want AAPL", json["symbol"])
	}
}

func TestCustomerToJSON(t *testing.T) {
	email := "test@example.com"
	kycStatus := "verified"

	customer := domain.Customer{
		CustomerID: "cust-123",
		Name:       "Test Customer",
		Email:      &email,
		KYCStatus:  &kycStatus,
		CreatedAt:   ts(),
	}

	t.Run("without score", func(t *testing.T) {
		json := customerToJSON(customer, nil)
		if json["customer_id"] != "cust-123" {
			t.Errorf("customer_id = %v; want cust-123", json["customer_id"])
		}
		if json["ai_identity_score"] != nil {
			t.Errorf("ai_identity_score should be nil")
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

func TestAccountToJSON(t *testing.T) {
	account := domain.Account{
		AccountID:   "acc-123",
		CustomerID:  "cust-456",
		AccountType: "trading",
		Currency:    "USD",
		Status:      "active",
		OpenedAt:    ts(),
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

func TestOrderToJSON(t *testing.T) {
	order := domain.Order{
		OrderID:      "ord-123",
		AccountID:    "acc-456",
		InstrumentID: "inst-789",
		Side:         "buy",
		Quantity:     100,
		OrderType:    "market",
		Status:       "filled",
		CreatedAt:    ts(),
	}

	json := orderToJSON(order)

	if json["order_id"] != "ord-123" {
		t.Errorf("order_id = %v; want ord-123", json["order_id"])
	}
	if json["side"] != "buy" {
		t.Errorf("side = %v; want buy", json["side"])
	}
	if json["quantity"] != float64(100) {
		t.Errorf("quantity = %v; want 100", json["quantity"])
	}
}

func TestTradeToJSON(t *testing.T) {
	trade := domain.Trade{
		TradeID:    "trade-123",
		OrderID:    "ord-456",
		Quantity:   50,
		Price:      150.5,
		Fee:        func() *float64 { v := 1.5; return &v }(),
		ExecutedAt: ts(),
	}

	json := tradeToJSON(trade)

	if json["trade_id"] != "trade-123" {
		t.Errorf("trade_id = %v; want trade-123", json["trade_id"])
	}
	if json["order_id"] != "ord-456" {
		t.Errorf("order_id = %v; want ord-456", json["order_id"])
	}
}

func TestWatchlistToJSON(t *testing.T) {
	watchlist := domain.Watchlist{
		WatchlistID: "wl-123",
		CustomerID:  "cust-456",
		Name:        "My Watchlist",
		CreatedAt:   ts(),
	}

	json := watchlistToJSON(watchlist)

	if json["watchlist_id"] != "wl-123" {
		t.Errorf("watchlist_id = %v; want wl-123", json["watchlist_id"])
	}
	if json["name"] != "My Watchlist" {
		t.Errorf("name = %v; want My Watchlist", json["name"])
	}
}

func TestWatchlistItemToJSON(t *testing.T) {
	item := domain.WatchlistItem{
		WatchlistItemID: "wi-123",
		WatchlistID:     "wl-456",
		InstrumentID:   "inst-789",
		AddedAt:         ts(),
	}

	json := watchlistItemToJSON(item)

	if json["watchlist_item_id"] != "wi-123" {
		t.Errorf("watchlist_item_id = %v; want wi-123", json["watchlist_item_id"])
	}
}

func TestMarketDataToJSON(t *testing.T) {
	open := 100.0
	high := 105.0
	low := 99.0
	volume := 1000000.0
	changePct := 2.5

	data := domain.MarketData{
		DataID:       "md-123",
		InstrumentID: "inst-456",
		Open:         &open,
		High:         &high,
		Low:          &low,
		Close:        104.0,
		Volume:       &volume,
		ChangePct:    &changePct,
	}

	json := marketDataToJSON(data)

	if json["data_id"] != "md-123" {
		t.Errorf("data_id = %v; want md-123", json["data_id"])
	}
	if json["close"] != 104.0 {
		t.Errorf("close = %v; want 104.0", json["close"])
	}
}

func TestCashTransactionToJSON(t *testing.T) {
	tx := domain.CashTransaction{
		TransactionID: "tx-123",
		AccountID:     "acc-456",
		Type:          "deposit",
		Amount:        1000.0,
		Currency:      "USD",
		Status:        "completed",
		CreatedAt:     ts(),
	}

	json := cashTransactionToJSON(tx)

	if json["transaction_id"] != "tx-123" {
		t.Errorf("transaction_id = %v; want tx-123", json["transaction_id"])
	}
	if json["type"] != "deposit" {
		t.Errorf("type = %v; want deposit", json["type"])
	}
}

func TestPaymentToJSON(t *testing.T) {
	counterparty := "Vendor ABC"
	payment := domain.Payment{
		PaymentID:    "pmt-123",
		AccountID:   "acc-456",
		Counterparty: &counterparty,
		Amount:      500.0,
		Currency:    "USD",
		Status:      "pending",
		CreatedAt:   ts(),
	}

	json := paymentToJSON(payment)

	if json["payment_id"] != "pmt-123" {
		t.Errorf("payment_id = %v; want pmt-123", json["payment_id"])
	}
}

func TestSettlementToJSON(t *testing.T) {
	now := ts()
	settlement := domain.Settlement{
		SettlementID: "stl-123",
		TradeID:     "trade-456",
		PaymentID:   "pmt-789",
		Status:      "settled",
		SettledAt:   &now,
	}

	json := settlementToJSON(settlement)

	if json["settlement_id"] != "stl-123" {
		t.Errorf("settlement_id = %v; want stl-123", json["settlement_id"])
	}
}

func TestPortfolioToJSON(t *testing.T) {
	portfolio := domain.PortfolioSchema{
		PortfolioID:   "pf-123",
		AccountID:    "acc-456",
		Name:         "Growth Portfolio",
		BaseCurrency: "USD",
		CreatedAt:    ts(),
	}

	json := portfolioToJSON(portfolio)

	if json["portfolio_id"] != "pf-123" {
		t.Errorf("portfolio_id = %v; want pf-123", json["portfolio_id"])
	}
	if json["name"] != "Growth Portfolio" {
		t.Errorf("name = %v; want Growth Portfolio", json["name"])
	}
}

func TestPositionToJSON(t *testing.T) {
	costBasis := 15000.0
	position := domain.Position{
		PositionID:  "pos-123",
		PortfolioID: "pf-456",
		InstrumentID: "inst-789",
		Quantity:   100,
		CostBasis:  &costBasis,
		AsOfDate:   "2024-01-15",
	}

	json := positionToJSON(position)

	if json["position_id"] != "pos-123" {
		t.Errorf("position_id = %v; want pos-123", json["position_id"])
	}
}

func TestBlockToJSON(t *testing.T) {
	block := domain.Block{
		Index:          1,
		Timestamp:     ts(),
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

func TestTxToJSON(t *testing.T) {
	tx := domain.ChainTransaction{
		TxID:              "tx-123",
		BlockIndex:        1,
		SenderAccountID:   "acc-sender",
		ReceiverAccountID: "acc-receiver",
		Amount:            100.0,
		Currency:          "SIM_COIN",
		CreatedAt:         ts(),
	}

	json := txToJSON(tx)

	if json["tx_id"] != "tx-123" {
		t.Errorf("tx_id = %v; want tx-123", json["tx_id"])
	}
	if json["sender_account_id"] != "acc-sender" {
		t.Errorf("sender_account_id = %v; want acc-sender", json["sender_account_id"])
	}
}
