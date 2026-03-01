package persistence

import (
	"context"

	"finpulse/server-go/internal/domain"
	"finpulse/server-go/internal/infrastructure/crypto"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BlockchainLedgerRepo struct {
	pool *pgxpool.Pool
}

func NewBlockchainLedgerRepo(pool *pgxpool.Pool) *BlockchainLedgerRepo {
	return &BlockchainLedgerRepo{pool: pool}
}

func (r *BlockchainLedgerRepo) AppendBlock(ctx context.Context, tx pgx.Tx, block domain.Block, txs []domain.ChainTransaction) error {
	hash := block.Hash
	if hash == "" {
		hash = crypto.ComputeBlockHash(block.Index, block.Timestamp, block.PreviousHash, block.TransactionIDs)
	}
	_, err := tx.Exec(ctx,
		`INSERT INTO block (block_index, timestamp, previous_hash, hash) VALUES ($1, $2, $3, $4)`,
		block.Index, block.Timestamp, block.PreviousHash, hash)
	if err != nil {
		return err
	}
	for _, t := range txs {
		_, err = tx.Exec(ctx,
			`INSERT INTO chain_transaction (tx_id, block_index, sender_account_id, receiver_account_id, amount, currency, created_at)
			 VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7)`,
			t.TxID, t.BlockIndex, t.SenderAccountID, t.ReceiverAccountID, t.Amount, t.Currency, t.CreatedAt)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *BlockchainLedgerRepo) GetBlockByIndex(ctx context.Context, blockIndex int) (*domain.Block, error) {
	var b domain.Block
	err := r.pool.QueryRow(ctx,
		`SELECT block_index, timestamp, previous_hash, hash FROM block WHERE block_index = $1`,
		blockIndex,
	).Scan(&b.Index, &b.Timestamp, &b.PreviousHash, &b.Hash)
	if err != nil {
		return nil, err
	}
	rows, err := r.pool.Query(ctx,
		`SELECT tx_id::text FROM chain_transaction WHERE block_index = $1`,
		blockIndex)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var txID string
		if err := rows.Scan(&txID); err != nil {
			return nil, err
		}
		b.TransactionIDs = append(b.TransactionIDs, txID)
	}
	return &b, rows.Err()
}

func (r *BlockchainLedgerRepo) GetLatestBlock(ctx context.Context) (*domain.Block, error) {
	var b domain.Block
	err := r.pool.QueryRow(ctx,
		`SELECT block_index, timestamp, previous_hash, hash FROM block ORDER BY block_index DESC LIMIT 1`,
	).Scan(&b.Index, &b.Timestamp, &b.PreviousHash, &b.Hash)
	if err != nil {
		return nil, err
	}
	rows, err := r.pool.Query(ctx,
		`SELECT tx_id::text FROM chain_transaction WHERE block_index = $1`,
		b.Index)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var txID string
		if err := rows.Scan(&txID); err != nil {
			return nil, err
		}
		b.TransactionIDs = append(b.TransactionIDs, txID)
	}
	return &b, rows.Err()
}

func (r *BlockchainLedgerRepo) GetLatestBlockForUpdate(ctx context.Context, tx pgx.Tx) (*domain.Block, error) {
	var b domain.Block
	err := tx.QueryRow(ctx,
		`SELECT block_index, timestamp, previous_hash, hash FROM block ORDER BY block_index DESC LIMIT 1 FOR UPDATE`,
	).Scan(&b.Index, &b.Timestamp, &b.PreviousHash, &b.Hash)
	if err != nil {
		return nil, err
	}
	rows, err := tx.Query(ctx,
		`SELECT tx_id::text FROM chain_transaction WHERE block_index = $1`,
		b.Index)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var txID string
		if err := rows.Scan(&txID); err != nil {
			return nil, err
		}
		b.TransactionIDs = append(b.TransactionIDs, txID)
	}
	return &b, rows.Err()
}

func (r *BlockchainLedgerRepo) ListBlocks(ctx context.Context, limit, offset int) ([]domain.Block, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT block_index, timestamp, previous_hash, hash FROM block ORDER BY block_index ASC LIMIT $1 OFFSET $2`,
		limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var blocks []domain.Block
	for rows.Next() {
		var b domain.Block
		if err := rows.Scan(&b.Index, &b.Timestamp, &b.PreviousHash, &b.Hash); err != nil {
			return nil, err
		}
		blocks = append(blocks, b)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(blocks) == 0 {
		return blocks, nil
	}
	indices := make([]int, len(blocks))
	for i := range blocks {
		indices[i] = blocks[i].Index
	}
	txRows, err := r.pool.Query(ctx,
		`SELECT block_index, tx_id::text FROM chain_transaction WHERE block_index = ANY($1)`,
		indices)
	if err != nil {
		return nil, err
	}
	defer txRows.Close()
	byBlock := make(map[int][]string)
	for txRows.Next() {
		var idx int
		var txID string
		if err := txRows.Scan(&idx, &txID); err != nil {
			return nil, err
		}
		byBlock[idx] = append(byBlock[idx], txID)
	}
	if err := txRows.Err(); err != nil {
		return nil, err
	}
	for i := range blocks {
		blocks[i].TransactionIDs = byBlock[blocks[i].Index]
	}
	return blocks, nil
}

func (r *BlockchainLedgerRepo) GetTransaction(ctx context.Context, txID string) (*domain.ChainTransaction, error) {
	var tx domain.ChainTransaction
	err := r.pool.QueryRow(ctx,
		`SELECT tx_id::text, block_index, sender_account_id::text, receiver_account_id::text, amount, currency, created_at
		 FROM chain_transaction WHERE tx_id = $1::uuid`,
		txID,
	).Scan(&tx.TxID, &tx.BlockIndex, &tx.SenderAccountID, &tx.ReceiverAccountID, &tx.Amount, &tx.Currency, &tx.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *BlockchainLedgerRepo) ListTransactionsByBlock(ctx context.Context, blockIndex int) ([]domain.ChainTransaction, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT tx_id::text, block_index, sender_account_id::text, receiver_account_id::text, amount, currency, created_at
		 FROM chain_transaction WHERE block_index = $1`,
		blockIndex)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var txs []domain.ChainTransaction
	for rows.Next() {
		var tx domain.ChainTransaction
		if err := rows.Scan(&tx.TxID, &tx.BlockIndex, &tx.SenderAccountID, &tx.ReceiverAccountID, &tx.Amount, &tx.Currency, &tx.CreatedAt); err != nil {
			return nil, err
		}
		txs = append(txs, tx)
	}
	return txs, rows.Err()
}
