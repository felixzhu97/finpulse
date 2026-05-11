package handler

import (
	"testing"
	"time"
)

func TestParseMarketDataTimestamp(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		wantOK    bool
		wantPanic bool
	}{
		{
			name:   "valid RFC3339",
			input:  "2024-01-15T10:30:00Z",
			wantOK: true,
		},
		{
			name:   "valid RFC3339 with timezone",
			input:  "2024-01-15T10:30:00+08:00",
			wantOK: true,
		},
		{
			name:   "valid alternate format",
			input:  "2024-01-15T10:30:00+00:00",
			wantOK: true,
		},
		{
			name:   "invalid format",
			input:  "not a timestamp",
			wantOK: false,
		},
		{
			name:   "empty string",
			input:  "",
			wantOK: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts, ok := parseMarketDataTimestamp(tt.input)
			if ok != tt.wantOK {
				t.Errorf("parseMarketDataTimestamp(%q) ok = %v; want %v", tt.input, ok, tt.wantOK)
			}
			if tt.wantOK && ts.IsZero() {
				t.Errorf("parseMarketDataTimestamp(%q) returned zero time", tt.input)
			}
		})
	}

	t.Run("returns correct time for valid input", func(t *testing.T) {
		ts, ok := parseMarketDataTimestamp("2024-06-15T14:30:00Z")
		if !ok {
			t.Fatal("expected valid timestamp")
		}
		expected := time.Date(2024, 6, 15, 14, 30, 0, 0, time.UTC)
		if !ts.Equal(expected) {
			t.Errorf("time = %v; want %v", ts, expected)
		}
	})
}
