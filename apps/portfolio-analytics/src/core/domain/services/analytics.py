def fraud_recommendation(is_anomaly: bool, anomaly_score: float) -> str:
  if is_anomaly and anomaly_score < -0.5:
    return "block"
  if is_anomaly:
    return "review"
  return "allow"


def surveillance_alert_type(is_anomaly: bool, quantity_zscore: float, notional_zscore: float) -> str:
  threshold = 2.5
  if not is_anomaly:
    return "none"
  q_breach = abs(quantity_zscore) > threshold
  n_breach = abs(notional_zscore) > threshold
  if q_breach and n_breach:
    return "volume_and_notional_deviation"
  if q_breach:
    return "volume_spike"
  return "notional_deviation"


def identity_kyc_tier(identity_score: float) -> str:
  if identity_score >= 0.75:
    return "high"
  if identity_score >= 0.5:
    return "medium"
  return "low"


def var_interpretation(var: float, confidence: float) -> str:
  var_pct = var * 100
  if var < 0:
    return f"At {confidence:.0%} confidence, portfolio daily loss may exceed {abs(var_pct):.2f}%."
  return f"At {confidence:.0%} confidence, worst daily return is {var_pct:.2f}%."
