package domain

import "time"

type Block struct {
	Index          int
	Timestamp      time.Time
	PreviousHash   string
	TransactionIDs []string
	Hash           string
}

type ChainTransaction struct {
	TxID              string
	BlockIndex        int
	SenderAccountID   string
	ReceiverAccountID string
	Amount            float64
	Currency          string
	CreatedAt         time.Time
}

type WalletBalance struct {
	AccountID string
	Currency  string
	Balance   float64
	UpdatedAt time.Time
}
