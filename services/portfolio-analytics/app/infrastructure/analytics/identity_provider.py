import re
from typing import Optional

from app.domain.analytics.domain_services import identity_kyc_tier


class IdentityProvider:
  def score(
    self,
    document_type: str,
    name_on_document: str,
    date_of_birth: Optional[str] = None,
    id_number: Optional[str] = None,
  ) -> dict:
    score = 0.0
    checks = []
    if document_type and document_type.lower() in ("passport", "id_card", "drivers_license"):
      score += 0.25
      checks.append("document_type_recognized")
    if name_on_document and len(name_on_document.strip()) >= 4 and re.match(r"^[\w\s\-\.]+$", name_on_document.strip()):
      score += 0.25
      checks.append("name_format_valid")
    if date_of_birth and re.match(r"^\d{4}-\d{2}-\d{2}$", date_of_birth.strip()):
      score += 0.25
      checks.append("dob_format_valid")
    if id_number and len(id_number.strip()) >= 6:
      score += 0.25
      checks.append("id_number_present")
    s = min(score, 1.0)
    kyc_tier = identity_kyc_tier(s)
    return {
      "identity_score": s,
      "kyc_tier": kyc_tier,
      "checks": checks,
      "document_type": document_type,
    }
