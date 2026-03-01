package crypto

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"sort"
	"time"
)

func ComputeBlockHash(index int, timestamp time.Time, previousHash string, transactionIDs []string) string {
	m := map[string]interface{}{
		"index":           index,
		"previous_hash":   previousHash,
		"timestamp":       timestamp.UTC().Format(time.RFC3339Nano),
		"transaction_ids": transactionIDs,
	}
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var buf bytes.Buffer
	buf.WriteByte('{')
	for i, k := range keys {
		if i > 0 {
			buf.WriteByte(',')
		}
		kb, _ := json.Marshal(k)
		vb, _ := json.Marshal(m[k])
		buf.Write(kb)
		buf.WriteByte(':')
		buf.Write(vb)
	}
	buf.WriteByte('}')
	digest := sha256.Sum256(buf.Bytes())
	return hex.EncodeToString(digest[:])
}
