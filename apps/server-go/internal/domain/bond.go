package domain

type Bond struct {
	BondID       string   `json:"bond_id"`
	InstrumentID string   `json:"instrument_id"`
	FaceValue    *float64 `json:"face_value,omitempty"`
	CouponRate   *float64 `json:"coupon_rate,omitempty"`
	YTM          *float64 `json:"ytm,omitempty"`
	Duration     *float64 `json:"duration,omitempty"`
	Convexity    *float64 `json:"convexity,omitempty"`
	MaturityYears *float64 `json:"maturity_years,omitempty"`
	Frequency    *int     `json:"frequency,omitempty"`
}
