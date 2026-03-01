package domain

import (
	"math"
	"regexp"
	"strings"
)

var (
	nameRegex   = regexp.MustCompile(`^[\w\s\-\.]+$`)
	dobRegex    = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
	docTypes    = map[string]bool{"passport": true, "id_card": true, "drivers_license": true}
)

func IdentityKYCTier(score float64) string {
	if score >= 0.75 {
		return "high"
	}
	if score >= 0.5 {
		return "medium"
	}
	return "low"
}

func FraudRecommendation(isAnomaly bool, anomalyScore float64) string {
	if isAnomaly && anomalyScore < -0.5 {
		return "block"
	}
	if isAnomaly {
		return "review"
	}
	return "allow"
}

func SurveillanceAlertType(isAnomaly bool, quantityZscore, notionalZscore float64) string {
	const threshold = 2.5
	if !isAnomaly {
		return "none"
	}
	qBreach := math.Abs(quantityZscore) > threshold
	nBreach := math.Abs(notionalZscore) > threshold
	if qBreach && nBreach {
		return "volume_and_notional_deviation"
	}
	if qBreach {
		return "volume_spike"
	}
	return "notional_deviation"
}

type IdentityScoreResult struct {
	IdentityScore float64  `json:"identity_score"`
	KYCTier       string   `json:"kyc_tier"`
	Checks        []string `json:"checks"`
	DocumentType  string   `json:"document_type"`
}

func ScoreIdentity(documentType, nameOnDocument, dateOfBirth, idNumber string) IdentityScoreResult {
	var score float64
	var checks []string
	if documentType != "" && docTypes[strings.ToLower(documentType)] {
		score += 0.25
		checks = append(checks, "document_type_recognized")
	}
	name := strings.TrimSpace(nameOnDocument)
	if name != "" && len(name) >= 4 && nameRegex.MatchString(name) {
		score += 0.25
		checks = append(checks, "name_format_valid")
	}
	dob := strings.TrimSpace(dateOfBirth)
	if dob != "" && dobRegex.MatchString(dob) {
		score += 0.25
		checks = append(checks, "dob_format_valid")
	}
	id := strings.TrimSpace(idNumber)
	if id != "" && len(id) >= 6 {
		score += 0.25
		checks = append(checks, "id_number_present")
	}
	if score > 1.0 {
		score = 1.0
	}
	return IdentityScoreResult{
		IdentityScore: score,
		KYCTier:       IdentityKYCTier(score),
		Checks:        checks,
		DocumentType:  documentType,
	}
}
