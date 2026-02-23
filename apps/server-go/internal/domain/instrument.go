package domain

type Instrument struct {
	InstrumentID string  `json:"instrument_id"`
	Symbol       string  `json:"symbol"`
	Name         *string `json:"name"`
	AssetClass   *string `json:"asset_class"`
	Currency     *string `json:"currency"`
	Exchange     *string `json:"exchange"`
}
