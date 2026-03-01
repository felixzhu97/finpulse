package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"finpulse/server-go/internal/application"
	"finpulse/server-go/internal/domain"
)

const (
	blockchainPrefix = "blockchain:"
	cacheTTL         = 300
)

func (h *Handler) BlockchainSeedBalance(c *gin.Context) {
	var body struct {
		AccountID string  `json:"account_id" binding:"required"`
		Currency  string  `json:"currency"`
		Amount    float64 `json:"amount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Currency == "" {
		body.Currency = "SIM_COIN"
	}
	wallet, err := h.BlockchainSvc.SeedBalance(c.Request.Context(), body.AccountID, body.Currency, body.Amount)
	if err != nil {
		if errors.Is(err, application.ErrInvalidAmount) {
			c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if h.Cache != nil {
		_ = h.Cache.Delete(c.Request.Context(), blockchainPrefix+"balance:"+body.AccountID+":"+body.Currency)
	}
	c.JSON(http.StatusCreated, gin.H{
		"account_id": wallet.AccountID,
		"currency":   wallet.Currency,
		"balance":    wallet.Balance,
	})
}

func (h *Handler) BlockchainListBlocks(c *gin.Context) {
	limit, offset := 100, 0
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n >= 1 && n <= 500 {
			limit = n
		}
	}
	if o := c.Query("offset"); o != "" {
		if n, err := strconv.Atoi(o); err == nil && n >= 0 {
			offset = n
		}
	}
	cacheKey := blockchainPrefix + "blocks:" + strconv.Itoa(limit) + ":" + strconv.Itoa(offset)
	if h.Cache != nil {
		if cached, err := h.Cache.Get(c.Request.Context(), cacheKey); err == nil && cached != nil {
			c.JSON(http.StatusOK, cached)
			return
		}
	}
	blocks, err := h.BlockchainSvc.GetChain(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	resp := make([]gin.H, len(blocks))
	for i, b := range blocks {
		resp[i] = blockToJSON(b)
	}
	if h.Cache != nil {
		_ = h.Cache.Set(c.Request.Context(), cacheKey, resp, cacheTTL)
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) BlockchainGetBlock(c *gin.Context) {
	idx, err := strconv.Atoi(c.Param("block_index"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "invalid block_index"})
		return
	}
	cacheKey := blockchainPrefix + "block_txs:" + strconv.Itoa(idx)
	if h.Cache != nil {
		if cached, err := h.Cache.Get(c.Request.Context(), cacheKey); err == nil && cached != nil {
			c.JSON(http.StatusOK, cached)
			return
		}
	}
	block, txs, err := h.BlockchainSvc.GetBlockWithTransactions(c.Request.Context(), idx)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Block not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	txResp := make([]gin.H, len(txs))
	for i, t := range txs {
		txResp[i] = txToJSON(t)
	}
	resp := gin.H{
		"block":        blockToJSON(*block),
		"transactions": txResp,
	}
	if h.Cache != nil {
		_ = h.Cache.Set(c.Request.Context(), cacheKey, resp, cacheTTL)
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) BlockchainTransfer(c *gin.Context) {
	var body struct {
		SenderAccountID   string  `json:"sender_account_id" binding:"required"`
		ReceiverAccountID string  `json:"receiver_account_id" binding:"required"`
		Amount            float64 `json:"amount" binding:"required"`
		Currency          string  `json:"currency"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	if body.Currency == "" {
		body.Currency = "SIM_COIN"
	}
	tx, err := h.BlockchainSvc.SubmitTransfer(c.Request.Context(), body.SenderAccountID, body.ReceiverAccountID, body.Amount, body.Currency)
	if err != nil {
		if errors.Is(err, application.ErrInsufficientBalance) || errors.Is(err, application.ErrInvalidAmount) {
			c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	if h.Cache != nil {
		_ = h.Cache.DeleteByPrefix(c.Request.Context(), blockchainPrefix)
	}
	c.JSON(http.StatusCreated, txToJSON(*tx))
}

func (h *Handler) BlockchainGetTransaction(c *gin.Context) {
	txID := c.Param("tx_id")
	cacheKey := blockchainPrefix + "tx:" + txID
	if h.Cache != nil {
		if cached, err := h.Cache.Get(c.Request.Context(), cacheKey); err == nil && cached != nil {
			c.JSON(http.StatusOK, cached)
			return
		}
	}
	tx, err := h.BlockchainSvc.GetTransaction(c.Request.Context(), txID)
	if err != nil {
		if errors.Is(err, application.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Transaction not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	resp := txToJSON(*tx)
	if h.Cache != nil {
		_ = h.Cache.Set(c.Request.Context(), cacheKey, resp, cacheTTL)
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) BlockchainGetBalance(c *gin.Context) {
	accountID := c.Query("account_id")
	if accountID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "account_id required"})
		return
	}
	currency := c.DefaultQuery("currency", "SIM_COIN")
	cacheKey := blockchainPrefix + "balance:" + accountID + ":" + currency
	if h.Cache != nil {
		if cached, err := h.Cache.Get(c.Request.Context(), cacheKey); err == nil && cached != nil {
			c.JSON(http.StatusOK, cached)
			return
		}
	}
	balance, err := h.BlockchainSvc.GetBalance(c.Request.Context(), accountID, currency)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}
	resp := gin.H{
		"account_id": accountID,
		"currency":   currency,
		"balance":    balance,
	}
	if h.Cache != nil {
		_ = h.Cache.Set(c.Request.Context(), cacheKey, resp, cacheTTL)
	}
	c.JSON(http.StatusOK, resp)
}

func blockToJSON(b domain.Block) gin.H {
	return gin.H{
		"index":           b.Index,
		"timestamp":       b.Timestamp,
		"previous_hash":   b.PreviousHash,
		"transaction_ids": b.TransactionIDs,
		"hash":            b.Hash,
	}
}

func txToJSON(t domain.ChainTransaction) gin.H {
	return gin.H{
		"tx_id":               t.TxID,
		"block_index":         t.BlockIndex,
		"sender_account_id":   t.SenderAccountID,
		"receiver_account_id": t.ReceiverAccountID,
		"amount":              t.Amount,
		"currency":            t.Currency,
		"created_at":          t.CreatedAt,
	}
}
