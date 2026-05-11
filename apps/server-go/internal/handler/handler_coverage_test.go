package handler

import (
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

func TestUserPreferenceToJSON(t *testing.T) {
	theme := "dark"
	lang := "en"
	pref := domain.UserPreference{
		PreferenceID:         "pref-123",
		CustomerID:           "cust-456",
		Theme:                &theme,
		Language:             &lang,
		NotificationsEnabled: true,
		UpdatedAt:            time.Now(),
	}

	json := userPreferenceToJSON(pref)

	if json["preference_id"] != "pref-123" {
		t.Errorf("preference_id = %v; want pref-123", json["preference_id"])
	}
	if json["theme"] != &theme {
		t.Errorf("theme mismatch")
	}
}

func TestBondToJSON(t *testing.T) {
	fv := 1000.0
	bond := domain.Bond{
		BondID:       "bond-123",
		InstrumentID: "inst-456",
		FaceValue:    &fv,
		CouponRate:   func() *float64 { v := 3.5; return &v }(),
		YTM:          func() *float64 { v := 4.0; return &v }(),
		Duration:     func() *float64 { v := 5.5; return &v }(),
		Convexity:    func() *float64 { v := 0.5; return &v }(),
		MaturityYears: func() *float64 { v := 10.0; return &v }(),
		Frequency:    func() *int { v := 2; return &v }(),
	}

	json := bondToJSON(bond)

	if json["bond_id"] != "bond-123" {
		t.Errorf("bond_id = %v; want bond-123", json["bond_id"])
	}
	if json["face_value"] != &fv {
		t.Errorf("face_value mismatch")
	}
}

func TestOptionToJSON(t *testing.T) {
	expiry := time.Now().AddDate(1, 0, 0)
	option := domain.Option{
		OptionID:               "opt-123",
		InstrumentID:           "inst-456",
		UnderlyingInstrumentID: "inst-underlying",
		Strike:                 150.0,
		Expiry:                 expiry,
		OptionType:             "call",
		RiskFreeRate:           func() *float64 { v := 0.05; return &v }(),
		Volatility:             func() *float64 { v := 0.25; return &v }(),
		BSPrice:                func() *float64 { v := 10.0; return &v }(),
		Delta:                  func() *float64 { v := 0.6; return &v }(),
		Gamma:                  func() *float64 { v := 0.02; return &v }(),
		Theta:                  func() *float64 { v := -0.1; return &v }(),
		Vega:                   func() *float64 { v := 0.15; return &v }(),
		Rho:                    func() *float64 { v := 0.05; return &v }(),
		ImpliedVolatility:      func() *float64 { v := 0.25; return &v }(),
	}

	json := optionToJSON(option)

	if json["option_id"] != "opt-123" {
		t.Errorf("option_id = %v; want opt-123", json["option_id"])
	}
	if json["option_type"] != "call" {
		t.Errorf("option_type = %v; want call", json["option_type"])
	}
}

func TestOrderToJSONCoverage(t *testing.T) {
	order := domain.Order{
		OrderID:      "ord-123",
		AccountID:    "acc-456",
		InstrumentID: "inst-789",
		Side:         "sell",
		Quantity:     200.0,
		OrderType:    "limit",
		Status:       "pending",
		CreatedAt:    time.Now(),
	}

	json := orderToJSON(order)

	if json["order_id"] != "ord-123" {
		t.Errorf("order_id = %v; want ord-123", json["order_id"])
	}
	if json["side"] != "sell" {
		t.Errorf("side = %v; want sell", json["side"])
	}
	if json["order_type"] != "limit" {
		t.Errorf("order_type = %v; want limit", json["order_type"])
	}
	if json["status"] != "pending" {
		t.Errorf("status = %v; want pending", json["status"])
	}
}

func TestTradeToJSONWithNonNilFee(t *testing.T) {
	fee := 5.50
	trade := domain.Trade{
		TradeID:    "trade-123",
		OrderID:    "ord-456",
		Quantity:   50.0,
		Price:      150.5,
		Fee:        &fee,
		ExecutedAt: time.Now(),
	}

	json := tradeToJSON(trade)

	if json["trade_id"] != "trade-123" {
		t.Errorf("trade_id = %v; want trade-123", json["trade_id"])
	}
	if json["fee"] != &fee {
		t.Errorf("fee mismatch")
	}
}

func TestMarketDataToJSONWithNonNilOptionals(t *testing.T) {
	open := 100.0
	high := 105.0
	low := 99.0
	volume := 1000000.0
	changePct := 2.5
	data := domain.MarketData{
		DataID:       "md-123",
		InstrumentID: "inst-456",
		Timestamp:    time.Now(),
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
	if json["open"] != &open {
		t.Errorf("open mismatch")
	}
	if json["close"] != 104.0 {
		t.Errorf("close = %v; want 104.0", json["close"])
	}
}

func TestPaymentToJSONWithCounterparty(t *testing.T) {
	counterparty := "Test Counterparty"
	payment := domain.Payment{
		PaymentID:    "pmt-123",
		AccountID:    "acc-456",
		Counterparty: &counterparty,
		Amount:       500.0,
		Currency:     "USD",
		Status:       "pending",
		CreatedAt:    time.Now(),
	}

	json := paymentToJSON(payment)

	if json["payment_id"] != "pmt-123" {
		t.Errorf("payment_id = %v; want pmt-123", json["payment_id"])
	}
	if json["counterparty"] != &counterparty {
		t.Errorf("counterparty mismatch")
	}
}

func TestSettlementToJSONWithSettledAt(t *testing.T) {
	settledAt := time.Now()
	settlement := domain.Settlement{
		SettlementID: "stl-123",
		TradeID:      "trade-456",
		PaymentID:    "pmt-789",
		Status:       "settled",
		SettledAt:    &settledAt,
	}

	json := settlementToJSON(settlement)

	if json["settlement_id"] != "stl-123" {
		t.Errorf("settlement_id = %v; want stl-123", json["settlement_id"])
	}
	if json["settled_at"] != &settledAt {
		t.Errorf("settled_at mismatch")
	}
}

func TestPositionToJSONWithCostBasis(t *testing.T) {
	costBasis := 150.0
	position := domain.Position{
		PositionID:  "pos-123",
		PortfolioID: "pf-456",
		InstrumentID: "inst-789",
		Quantity:    100.0,
		CostBasis:   &costBasis,
		AsOfDate:    "2024-01-15",
	}

	json := positionToJSON(position)

	if json["position_id"] != "pos-123" {
		t.Errorf("position_id = %v; want pos-123", json["position_id"])
	}
	if json["cost_basis"] != &costBasis {
		t.Errorf("cost_basis mismatch")
	}
}

func TestBondToJSONWithAllFields(t *testing.T) {
	fv := 1000.0
	coupon := 3.5
	ytm := 4.0
	duration := 5.5
	convexity := 0.5
	maturity := 10.0
	freq := 2
	bond := domain.Bond{
		BondID:       "bond-123",
		InstrumentID: "inst-456",
		FaceValue:    &fv,
		CouponRate:   &coupon,
		YTM:          &ytm,
		Duration:     &duration,
		Convexity:    &convexity,
		MaturityYears: &maturity,
		Frequency:    &freq,
	}

	json := bondToJSON(bond)

	if json["bond_id"] != "bond-123" {
		t.Errorf("bond_id = %v; want bond-123", json["bond_id"])
	}
	if json["face_value"] != &fv {
		t.Errorf("face_value mismatch")
	}
	if json["coupon_rate"] != &coupon {
		t.Errorf("coupon_rate mismatch")
	}
}

func TestOptionToJSONWithAllGreeks(t *testing.T) {
	expiry := time.Now().AddDate(1, 0, 0)
	rfr := 0.05
	vol := 0.25
	bsPrice := 10.0
	delta := 0.6
	gamma := 0.02
	theta := -0.1
	vega := 0.15
	rho := 0.05
	iv := 0.25
	option := domain.Option{
		OptionID:               "opt-123",
		InstrumentID:           "inst-456",
		UnderlyingInstrumentID: "inst-underlying",
		Strike:                 150.0,
		Expiry:                 expiry,
		OptionType:             "put",
		RiskFreeRate:           &rfr,
		Volatility:             &vol,
		BSPrice:                &bsPrice,
		Delta:                  &delta,
		Gamma:                  &gamma,
		Theta:                  &theta,
		Vega:                   &vega,
		Rho:                    &rho,
		ImpliedVolatility:      &iv,
	}

	json := optionToJSON(option)

	if json["option_id"] != "opt-123" {
		t.Errorf("option_id = %v; want opt-123", json["option_id"])
	}
	if json["delta"] != &delta {
		t.Errorf("delta mismatch")
	}
	if json["gamma"] != &gamma {
		t.Errorf("gamma mismatch")
	}
}

func TestUserPreferenceToJSONWithAllFields(t *testing.T) {
	theme := "light"
	lang := "zh"
	pref := domain.UserPreference{
		PreferenceID:         "pref-123",
		CustomerID:           "cust-456",
		Theme:                &theme,
		Language:             &lang,
		NotificationsEnabled: true,
		UpdatedAt:            time.Now(),
	}

	json := userPreferenceToJSON(pref)

	if json["preference_id"] != "pref-123" {
		t.Errorf("preference_id = %v; want pref-123", json["preference_id"])
	}
	if json["theme"] != &theme {
		t.Errorf("theme mismatch")
	}
	if json["language"] != &lang {
		t.Errorf("language mismatch")
	}
	if json["notifications_enabled"] != true {
		t.Errorf("notifications_enabled = %v; want true", json["notifications_enabled"])
	}
}
