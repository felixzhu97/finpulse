package application

import (
	"context"
	"errors"
	"time"

	"finpulse/server-go/internal/domain"

	"github.com/google/uuid"
)

type Tx any

type TxManager interface {
	WithTx(ctx context.Context, fn func(tx Tx) error) error
}

var (
	ErrInsufficientBalance = errors.New("insufficient balance")
	ErrInvalidAmount       = errors.New("amount must be positive")
)

type BlockchainLedger interface {
	GetLatestBlockForUpdate(ctx context.Context, tx Tx) (*domain.Block, error)
	GetLatestBlock(ctx context.Context) (*domain.Block, error)
	AppendBlock(ctx context.Context, tx Tx, block domain.Block, txs []domain.ChainTransaction) error
	ListBlocks(ctx context.Context, limit, offset int) ([]domain.Block, error)
	GetBlockByIndex(ctx context.Context, blockIndex int) (*domain.Block, error)
	ListTransactionsByBlock(ctx context.Context, blockIndex int) ([]domain.ChainTransaction, error)
	GetTransaction(ctx context.Context, txID string) (*domain.ChainTransaction, error)
}

type BlockchainWallet interface {
	GetBalanceForUpdate(ctx context.Context, tx Tx, accountID, currency string) (*domain.WalletBalance, error)
	UpdateBalance(ctx context.Context, tx Tx, accountID, currency string, delta float64) (*domain.WalletBalance, error)
	GetBalance(ctx context.Context, accountID, currency string) (float64, error)
}

type BlockchainService struct {
	txMgr TxManager
	ledger BlockchainLedger
	wallet BlockchainWallet
}

func NewBlockchainService(txMgr TxManager, ledger BlockchainLedger, wallet BlockchainWallet) *BlockchainService {
	return &BlockchainService{txMgr: txMgr, ledger: ledger, wallet: wallet}
}

func (s *BlockchainService) SubmitTransfer(ctx context.Context, senderID, receiverID string, amount float64, currency string) (*domain.ChainTransaction, error) {
	if amount <= 0 {
		return nil, ErrInvalidAmount
	}
	var result *domain.ChainTransaction
	err := s.txMgr.WithTx(ctx, func(tx Tx) error {
		_, err := s.ledger.GetLatestBlockForUpdate(ctx, tx)
		if err != nil && !errors.Is(err, ErrNotFound) {
			return err
		}
		firstID, secondID := senderID, receiverID
		if firstID > secondID {
			firstID, secondID = secondID, firstID
		}
		firstBal, _ := s.wallet.GetBalanceForUpdate(ctx, tx, firstID, currency)
		secondBal, _ := s.wallet.GetBalanceForUpdate(ctx, tx, secondID, currency)
		var senderBal *domain.WalletBalance
		if firstID == senderID {
			senderBal = firstBal
		} else {
			senderBal = secondBal
		}
		current := 0.0
		if senderBal != nil {
			current = senderBal.Balance
		}
		if current < amount {
			return ErrInsufficientBalance
		}
		latest, _ := s.ledger.GetLatestBlock(ctx)
		nextIndex := 0
		prevHash := "0"
		if latest != nil {
			nextIndex = latest.Index + 1
			prevHash = latest.Hash
		}
		now := time.Now().UTC()
		txID := uuid.New().String()
		block := domain.Block{
			Index:          nextIndex,
			Timestamp:      now,
			PreviousHash:   prevHash,
			TransactionIDs: []string{txID},
		}
		ct := domain.ChainTransaction{
			TxID:              txID,
			BlockIndex:        nextIndex,
			SenderAccountID:   senderID,
			ReceiverAccountID: receiverID,
			Amount:            amount,
			Currency:          currency,
			CreatedAt:         now,
		}
		if err := s.ledger.AppendBlock(ctx, tx, block, []domain.ChainTransaction{ct}); err != nil {
			return err
		}
		if _, err := s.wallet.UpdateBalance(ctx, tx, senderID, currency, -amount); err != nil {
			return err
		}
		if _, err := s.wallet.UpdateBalance(ctx, tx, receiverID, currency, amount); err != nil {
			return err
		}
		result = &ct
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (s *BlockchainService) GetBalance(ctx context.Context, accountID, currency string) (float64, error) {
	return s.wallet.GetBalance(ctx, accountID, currency)
}

func (s *BlockchainService) SeedBalance(ctx context.Context, accountID, currency string, amount float64) (*domain.WalletBalance, error) {
	if amount <= 0 {
		return nil, ErrInvalidAmount
	}
	var w *domain.WalletBalance
	err := s.txMgr.WithTx(ctx, func(tx Tx) error {
		var err error
		w, err = s.wallet.UpdateBalance(ctx, tx, accountID, currency, amount)
		return err
	})
	if err != nil {
		return nil, err
	}
	return w, nil
}

func (s *BlockchainService) GetChain(ctx context.Context, limit, offset int) ([]domain.Block, error) {
	return s.ledger.ListBlocks(ctx, limit, offset)
}

func (s *BlockchainService) GetBlock(ctx context.Context, blockIndex int) (*domain.Block, error) {
	return s.ledger.GetBlockByIndex(ctx, blockIndex)
}

func (s *BlockchainService) GetBlockWithTransactions(ctx context.Context, blockIndex int) (*domain.Block, []domain.ChainTransaction, error) {
	block, err := s.ledger.GetBlockByIndex(ctx, blockIndex)
	if err != nil {
		return nil, nil, err
	}
	txs, err := s.ledger.ListTransactionsByBlock(ctx, blockIndex)
	if err != nil {
		return nil, nil, err
	}
	return block, txs, nil
}

func (s *BlockchainService) GetTransaction(ctx context.Context, txID string) (*domain.ChainTransaction, error) {
	return s.ledger.GetTransaction(ctx, txID)
}
