import pytest

from src.core.domain.services.analytics import (
    fraud_recommendation,
    surveillance_alert_type,
    identity_kyc_tier,
    var_interpretation,
)


class TestFraudRecommendation:
    def test_block_high_anomaly_score(self):
        assert fraud_recommendation(is_anomaly=True, anomaly_score=-0.6) == "block"
        assert fraud_recommendation(is_anomaly=True, anomaly_score=-1.0) == "block"

    def test_review_low_anomaly_score(self):
        assert fraud_recommendation(is_anomaly=True, anomaly_score=-0.4) == "review"
        assert fraud_recommendation(is_anomaly=True, anomaly_score=0.0) == "review"
        assert fraud_recommendation(is_anomaly=True, anomaly_score=0.5) == "review"

    def test_allow_no_anomaly(self):
        assert fraud_recommendation(is_anomaly=False, anomaly_score=0.0) == "allow"
        assert fraud_recommendation(is_anomaly=False, anomaly_score=0.5) == "allow"

    def test_boundary_at_negative_half(self):
        assert fraud_recommendation(is_anomaly=True, anomaly_score=-0.51) == "block"
        assert fraud_recommendation(is_anomaly=True, anomaly_score=-0.49) == "review"


class TestSurveillanceAlertType:
    def test_no_alert_when_not_anomaly(self):
        assert surveillance_alert_type(is_anomaly=False, quantity_zscore=0.0, notional_zscore=0.0) == "none"
        assert surveillance_alert_type(is_anomaly=False, quantity_zscore=3.0, notional_zscore=3.0) == "none"

    def test_volume_and_notional_deviation(self):
        result = surveillance_alert_type(is_anomaly=True, quantity_zscore=3.0, notional_zscore=3.0)
        assert result == "volume_and_notional_deviation"

    def test_volume_spike_only(self):
        result = surveillance_alert_type(is_anomaly=True, quantity_zscore=3.0, notional_zscore=1.0)
        assert result == "volume_spike"

    def test_notional_deviation_only(self):
        result = surveillance_alert_type(is_anomaly=True, quantity_zscore=1.0, notional_zscore=3.0)
        assert result == "notional_deviation"

    def test_above_threshold(self):
        result = surveillance_alert_type(is_anomaly=True, quantity_zscore=2.6, notional_zscore=2.6)
        assert result == "volume_and_notional_deviation"

    def test_negative_zscore(self):
        result = surveillance_alert_type(is_anomaly=True, quantity_zscore=-3.0, notional_zscore=-3.0)
        assert result == "volume_and_notional_deviation"


class TestIdentityKycTier:
    def test_high_tier(self):
        assert identity_kyc_tier(identity_score=0.75) == "high"
        assert identity_kyc_tier(identity_score=0.80) == "high"
        assert identity_kyc_tier(identity_score=1.0) == "high"

    def test_medium_tier(self):
        assert identity_kyc_tier(identity_score=0.5) == "medium"
        assert identity_kyc_tier(identity_score=0.60) == "medium"
        assert identity_kyc_tier(identity_score=0.74) == "medium"

    def test_low_tier(self):
        assert identity_kyc_tier(identity_score=0.0) == "low"
        assert identity_kyc_tier(identity_score=0.25) == "low"
        assert identity_kyc_tier(identity_score=0.49) == "low"

    def test_boundary_values(self):
        assert identity_kyc_tier(identity_score=0.749) == "medium"
        assert identity_kyc_tier(identity_score=0.751) == "high"


class TestVarInterpretation:
    def test_negative_var(self):
        result = var_interpretation(var=-0.02, confidence=0.95)
        assert "2.00%" in result
        assert "loss may exceed" in result

    def test_positive_var(self):
        result = var_interpretation(var=0.015, confidence=0.99)
        assert "1.50%" in result
        assert "worst daily return" in result

    def test_zero_var(self):
        result = var_interpretation(var=0.0, confidence=0.95)
        assert "0.00%" in result

    def test_confidence_levels(self):
        result_90 = var_interpretation(var=-0.01, confidence=0.90)
        result_95 = var_interpretation(var=-0.01, confidence=0.95)
        result_99 = var_interpretation(var=-0.01, confidence=0.99)
        
        assert "90%" in result_90
        assert "95%" in result_95
        assert "99%" in result_99

    def test_large_var(self):
        result = var_interpretation(var=-0.15, confidence=0.95)
        assert "15.00%" in result
