package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"finpulse/server-go/internal/domain"
)

type blockchainLedgerMock struct {
	blocks       []domain.Block
	transactions []domain.ChainTransaction
	err          error
}

func newBlockchainLedgerMock() *blockchainLedgerMock {
	return &blockchainLedgerMock{
		blocks:       []domain.Block{},
		transactions: []domain.ChainTransaction{},
	}
}

func (m *blockchainLedgerMock) GetLatestBlockForUpdate(ctx context.Context, tx Tx) (*domain.Block, error) {
	if m.err != nil {
		return nil, m.err
	}
	if len(m.blocks) == 0 {
		return nil, ErrNotFound
	}
	return &m.blocks[len(m.blocks)-1], nil
}

func (m *blockchainLedgerMock) GetLatestBlock(ctx context.Context) (*domain.Block, error) {
	if m.err != nil {
		return nil, m.err
	}
	if len(m.blocks) == 0 {
		return nil, ErrNotFound
	}
	return &m.blocks[len(m.blocks)-1], nil
}

func (m *blockchainLedgerMock) AppendBlock(ctx context.Context, tx Tx, block domain.Block, txs []domain.ChainTransaction) error {
	if m.err != nil {
		return m.err
	}
	m.blocks = append(m.blocks, block)
	m.transactions = append(m.transactions, txs...)
	return nil
}

func (m *blockchainLedgerMock) ListBlocks(ctx context.Context, limit, offset int) ([]domain.Block, error) {
	if m.err != nil {
		return nil, m.err
	}
	if offset >= len(m.blocks) {
		return []domain.Block{}, nil
	}
	end := offset + limit
	if end > len(m.blocks) {
		end = len(m.blocks)
	}
	return m.blocks[offset:end], nil
}

func (m *blockchainLedgerMock) GetBlockByIndex(ctx context.Context, blockIndex int) (*domain.Block, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, b := range m.blocks {
		if b.Index == blockIndex {
			return &b, nil
		}
	}
	return nil, ErrNotFound
}

func (m *blockchainLedgerMock) ListTransactionsByBlock(ctx context.Context, blockIndex int) ([]domain.ChainTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []domain.ChainTransaction
	for _, t := range m.transactions {
		if t.BlockIndex == blockIndex {
			result = append(result, t)
		}
	}
	return result, nil
}

func (m *blockchainLedgerMock) GetTransaction(ctx context.Context, txID string) (*domain.ChainTransaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, t := range m.transactions {
		if t.TxID == txID {
			return &t, nil
		}
	}
	return nil, ErrNotFound
}

type blockchainWalletMock struct {
	balances map[string]*domain.WalletBalance
	err      error
}

func newBlockchainWalletMock() *blockchainWalletMock {
	return &blockchainWalletMock{
		balances: make(map[string]*domain.WalletBalance),
	}
}

func (m *blockchainWalletMock) GetBalanceForUpdate(ctx context.Context, tx Tx, accountID, currency string) (*domain.WalletBalance, error) {
	if m.err != nil {
		return nil, m.err
	}
	key := accountID + ":" + currency
	if bal, ok := m.balances[key]; ok {
		return bal, nil
	}
	return nil, nil
}

func (m *blockchainWalletMock) UpdateBalance(ctx context.Context, tx Tx, accountID, currency string, delta float64) (*domain.WalletBalance, error) {
	if m.err != nil {
		return nil, m.err
	}
	key := accountID + ":" + currency
	bal, ok := m.balances[key]
	if !ok {
		bal = &domain.WalletBalance{AccountID: accountID, Currency: currency, Balance: 0}
	}
	bal.Balance += delta
	bal.UpdatedAt = time.Now()
	m.balances[key] = bal
	return bal, nil
}

func (m *blockchainWalletMock) GetBalance(ctx context.Context, accountID, currency string) (float64, error) {
	if m.err != nil {
		return 0, m.err
	}
	key := accountID + ":" + currency
	if bal, ok := m.balances[key]; ok {
		return bal.Balance, nil
	}
	return 0, nil
}

type txManagerMock struct {
	err error
}

func newTxManagerMock() *txManagerMock {
	return &txManagerMock{}
}

func (m *txManagerMock) WithTx(ctx context.Context, fn func(tx Tx) error) error {
	if m.err != nil {
		return m.err
	}
	return fn(nil)
}

func TestBlockchainService_SubmitTransfer(t *testing.T) {
	t.Run("SubmitTransfer returns error for invalid amount", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.SubmitTransfer(context.Background(), "acc1", "acc2", -100, "USD")

		if !errors.Is(err, ErrInvalidAmount) {
			t.Errorf("SubmitTransfer() error = %v; want ErrInvalidAmount", err)
		}
	})

	t.Run("SubmitTransfer returns error for zero amount", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.SubmitTransfer(context.Background(), "acc1", "acc2", 0, "USD")

		if !errors.Is(err, ErrInvalidAmount) {
			t.Errorf("SubmitTransfer() error = %v; want ErrInvalidAmount", err)
		}
	})

	t.Run("SubmitTransfer returns error for insufficient balance", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.SubmitTransfer(context.Background(), "acc1", "acc2", 100, "USD")

		if !errors.Is(err, ErrInsufficientBalance) {
			t.Errorf("SubmitTransfer() error = %v; want ErrInsufficientBalance", err)
		}
	})

	t.Run("SubmitTransfer succeeds with sufficient balance", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		wallet.balances["acc1:USD"] = &domain.WalletBalance{AccountID: "acc1", Currency: "USD", Balance: 1000}

		result, err := svc.SubmitTransfer(context.Background(), "acc1", "acc2", 100, "USD")

		if err != nil {
			t.Errorf("SubmitTransfer() error = %v; want nil", err)
		}
		if result == nil {
			t.Fatal("SubmitTransfer() returned nil result")
		}
		if result.SenderAccountID != "acc1" {
			t.Errorf("SenderAccountID = %q; want acc1", result.SenderAccountID)
		}
		if result.ReceiverAccountID != "acc2" {
			t.Errorf("ReceiverAccountID = %q; want acc2", result.ReceiverAccountID)
		}
		if result.Amount != 100 {
			t.Errorf("Amount = %v; want 100", result.Amount)
		}
	})

	t.Run("SubmitTransfer succeeds with existing blocks", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		wallet.balances["acc1:USD"] = &domain.WalletBalance{AccountID: "acc1", Currency: "USD", Balance: 1000}
		ledger.blocks = append(ledger.blocks, domain.Block{
			Index:        0,
			Timestamp:    time.Now(),
			PreviousHash: "0",
			Hash:         "block0",
		})

		result, err := svc.SubmitTransfer(context.Background(), "acc1", "acc2", 50, "USD")

		if err != nil {
			t.Errorf("SubmitTransfer() error = %v; want nil", err)
		}
		if result.BlockIndex != 1 {
			t.Errorf("BlockIndex = %v; want 1", result.BlockIndex)
		}
	})
}

func TestBlockchainService_GetBalance(t *testing.T) {
	t.Run("GetBalance returns zero for nonexistent account", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		balance, err := svc.GetBalance(context.Background(), "acc1", "USD")

		if err != nil {
			t.Errorf("GetBalance() error = %v; want nil", err)
		}
		if balance != 0 {
			t.Errorf("balance = %v; want 0", balance)
		}
	})

	t.Run("GetBalance returns correct balance", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		wallet.balances["acc1:USD"] = &domain.WalletBalance{AccountID: "acc1", Currency: "USD", Balance: 500}

		balance, err := svc.GetBalance(context.Background(), "acc1", "USD")

		if err != nil {
			t.Errorf("GetBalance() error = %v; want nil", err)
		}
		if balance != 500 {
			t.Errorf("balance = %v; want 500", balance)
		}
	})
}

func TestBlockchainService_SeedBalance(t *testing.T) {
	t.Run("SeedBalance returns error for invalid amount", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.SeedBalance(context.Background(), "acc1", "USD", -100)

		if !errors.Is(err, ErrInvalidAmount) {
			t.Errorf("SeedBalance() error = %v; want ErrInvalidAmount", err)
		}
	})

	t.Run("SeedBalance returns error for zero amount", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.SeedBalance(context.Background(), "acc1", "USD", 0)

		if !errors.Is(err, ErrInvalidAmount) {
			t.Errorf("SeedBalance() error = %v; want ErrInvalidAmount", err)
		}
	})

	t.Run("SeedBalance creates new balance", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		result, err := svc.SeedBalance(context.Background(), "acc1", "USD", 1000)

		if err != nil {
			t.Errorf("SeedBalance() error = %v; want nil", err)
		}
		if result == nil {
			t.Fatal("SeedBalance() returned nil result")
		}
		if result.Balance != 1000 {
			t.Errorf("Balance = %v; want 1000", result.Balance)
		}
	})

	t.Run("SeedBalance adds to existing balance", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		wallet.balances["acc1:USD"] = &domain.WalletBalance{AccountID: "acc1", Currency: "USD", Balance: 500}

		result, err := svc.SeedBalance(context.Background(), "acc1", "USD", 300)

		if err != nil {
			t.Errorf("SeedBalance() error = %v; want nil", err)
		}
		if result.Balance != 800 {
			t.Errorf("Balance = %v; want 800", result.Balance)
		}
	})
}

func TestBlockchainService_GetChain(t *testing.T) {
	t.Run("GetChain returns empty list", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		blocks, err := svc.GetChain(context.Background(), 10, 0)

		if err != nil {
			t.Errorf("GetChain() error = %v; want nil", err)
		}
		if len(blocks) != 0 {
			t.Errorf("len(blocks) = %v; want 0", len(blocks))
		}
	})

	t.Run("GetChain returns blocks", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		ledger.blocks = append(ledger.blocks,
			domain.Block{Index: 0, Timestamp: time.Now(), PreviousHash: "0", Hash: "hash0"},
			domain.Block{Index: 1, Timestamp: time.Now(), PreviousHash: "hash0", Hash: "hash1"},
		)

		blocks, err := svc.GetChain(context.Background(), 10, 0)

		if err != nil {
			t.Errorf("GetChain() error = %v; want nil", err)
		}
		if len(blocks) != 2 {
			t.Errorf("len(blocks) = %v; want 2", len(blocks))
		}
	})

	t.Run("GetChain respects limit and offset", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		for i := 0; i < 5; i++ {
			ledger.blocks = append(ledger.blocks, domain.Block{Index: i, Hash: "hash"})
		}

		blocks, err := svc.GetChain(context.Background(), 2, 1)

		if err != nil {
			t.Errorf("GetChain() error = %v; want nil", err)
		}
		if len(blocks) != 2 {
			t.Errorf("len(blocks) = %v; want 2", len(blocks))
		}
		if blocks[0].Index != 1 {
			t.Errorf("blocks[0].Index = %v; want 1", blocks[0].Index)
		}
	})
}

func TestBlockchainService_GetBlock(t *testing.T) {
	t.Run("GetBlock returns not found", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.GetBlock(context.Background(), 0)

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetBlock() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("GetBlock returns block", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		ledger.blocks = append(ledger.blocks, domain.Block{Index: 5, Hash: "hash5"})

		block, err := svc.GetBlock(context.Background(), 5)

		if err != nil {
			t.Errorf("GetBlock() error = %v; want nil", err)
		}
		if block.Index != 5 {
			t.Errorf("block.Index = %v; want 5", block.Index)
		}
	})
}

func TestBlockchainService_GetBlockWithTransactions(t *testing.T) {
	t.Run("GetBlockWithTransactions returns block and transactions", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		ledger.blocks = append(ledger.blocks, domain.Block{Index: 1, Hash: "hash1"})
		ledger.transactions = append(ledger.transactions, domain.ChainTransaction{
			TxID: "tx1", BlockIndex: 1, SenderAccountID: "acc1", ReceiverAccountID: "acc2",
		})

		block, txs, err := svc.GetBlockWithTransactions(context.Background(), 1)

		if err != nil {
			t.Errorf("GetBlockWithTransactions() error = %v; want nil", err)
		}
		if block.Index != 1 {
			t.Errorf("block.Index = %v; want 1", block.Index)
		}
		if len(txs) != 1 {
			t.Errorf("len(txs) = %v; want 1", len(txs))
		}
	})
}

func TestBlockchainService_GetTransaction(t *testing.T) {
	t.Run("GetTransaction returns not found", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		_, err := svc.GetTransaction(context.Background(), "nonexistent")

		if !errors.Is(err, ErrNotFound) {
			t.Errorf("GetTransaction() error = %v; want ErrNotFound", err)
		}
	})

	t.Run("GetTransaction returns transaction", func(t *testing.T) {
		ledger := newBlockchainLedgerMock()
		wallet := newBlockchainWalletMock()
		txMgr := newTxManagerMock()
		svc := NewBlockchainService(txMgr, ledger, wallet)

		ledger.transactions = append(ledger.transactions, domain.ChainTransaction{
			TxID: "tx123", SenderAccountID: "acc1", ReceiverAccountID: "acc2", Amount: 100,
		})

		tx, err := svc.GetTransaction(context.Background(), "tx123")

		if err != nil {
			t.Errorf("GetTransaction() error = %v; want nil", err)
		}
		if tx.TxID != "tx123" {
			t.Errorf("tx.TxID = %q; want tx123", tx.TxID)
		}
	})
}
