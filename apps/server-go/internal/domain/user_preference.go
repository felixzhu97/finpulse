package domain

import "time"

type UserPreference struct {
	PreferenceID        string    `json:"preference_id"`
	CustomerID          string    `json:"customer_id"`
	Theme               *string   `json:"theme,omitempty"`
	Language            *string   `json:"language,omitempty"`
	NotificationsEnabled bool     `json:"notifications_enabled"`
	UpdatedAt           time.Time `json:"updated_at"`
}
