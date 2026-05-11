import pytest

from src.infrastructure.external_services.analytics.identity_provider import IdentityProvider


class TestIdentityProvider:
    """Tests for the IdentityProvider class."""

    @pytest.fixture
    def provider(self) -> IdentityProvider:
        return IdentityProvider()

    def test_score_valid_passport(self, provider: IdentityProvider) -> None:
        """Test scoring with valid passport."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert result["identity_score"] > 0
        assert "passport" in result["document_type"].lower()

    def test_score_valid_id_card(self, provider: IdentityProvider) -> None:
        """Test scoring with valid ID card."""
        result = provider.score(
            document_type="id_card",
            name_on_document="Jane Smith",
            date_of_birth="1985-05-15",
            id_number="ABC123456",
        )
        assert result["identity_score"] > 0
        assert "id_card" in result["document_type"].lower()

    def test_score_valid_drivers_license(self, provider: IdentityProvider) -> None:
        """Test scoring with valid driver's license."""
        result = provider.score(
            document_type="drivers_license",
            name_on_document="Bob Johnson",
            date_of_birth="1980-03-20",
            id_number="DL987654",
        )
        assert result["identity_score"] > 0
        assert "drivers_license" in result["document_type"].lower()

    def test_score_returns_required_fields(self, provider: IdentityProvider) -> None:
        """Test that score returns all required fields."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert "identity_score" in result
        assert "kyc_tier" in result
        assert "checks" in result
        assert "document_type" in result

    def test_score_partial_info(self, provider: IdentityProvider) -> None:
        """Test scoring with partial information."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth=None,
            id_number=None,
        )
        assert 0 <= result["identity_score"] <= 1.0

    def test_score_no_document_type(self, provider: IdentityProvider) -> None:
        """Test scoring without document type."""
        result = provider.score(
            document_type=None,  # type: ignore
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert "checks" in result

    def test_score_short_name(self, provider: IdentityProvider) -> None:
        """Test scoring with too short name."""
        result = provider.score(
            document_type="passport",
            name_on_document="Jo",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert "name_format_valid" not in result["checks"]

    def test_score_invalid_name_format(self, provider: IdentityProvider) -> None:
        """Test scoring with invalid name format."""
        result = provider.score(
            document_type="passport",
            name_on_document="John123@#$",  # Invalid characters
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert "name_format_valid" not in result["checks"]

    def test_score_invalid_dob_format(self, provider: IdentityProvider) -> None:
        """Test scoring with invalid date of birth format."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth="01-01-1990",  # Wrong format
            id_number="123456789",
        )
        assert "dob_format_valid" not in result["checks"]

    def test_score_short_id_number(self, provider: IdentityProvider) -> None:
        """Test scoring with too short ID number."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="12345",  # Too short
        )
        assert "id_number_present" not in result["checks"]

    def test_score_empty_checks(self, provider: IdentityProvider) -> None:
        """Test scoring with no valid information."""
        result = provider.score(
            document_type=None,  # type: ignore
            name_on_document="",
            date_of_birth=None,
            id_number=None,
        )
        assert result["identity_score"] == 0.0
        assert result["checks"] == []

    def test_score_max_score(self, provider: IdentityProvider) -> None:
        """Test scoring with all valid information."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert result["identity_score"] == 1.0
        assert len(result["checks"]) == 4
        assert "document_type_recognized" in result["checks"]
        assert "name_format_valid" in result["checks"]
        assert "dob_format_valid" in result["checks"]
        assert "id_number_present" in result["checks"]

    def test_score_document_type_case_insensitive(self, provider: IdentityProvider) -> None:
        """Test that document type matching is case insensitive."""
        result = provider.score(
            document_type="PASSPORT",
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert result["identity_score"] > 0
        assert "document_type_recognized" in result["checks"]

    def test_score_kyc_tier_included(self, provider: IdentityProvider) -> None:
        """Test that KYC tier is properly set."""
        result = provider.score(
            document_type="passport",
            name_on_document="John Doe",
            date_of_birth="1990-01-01",
            id_number="123456789",
        )
        assert result["kyc_tier"] is not None
