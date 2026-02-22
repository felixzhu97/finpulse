package domain

type Quote struct {
	Symbol     string  `json:"-"`
	Price      float64 `json:"price"`
	Change     float64 `json:"change"`
	ChangeRate float64 `json:"changeRate"`
	Timestamp  int     `json:"timestamp"`
}
