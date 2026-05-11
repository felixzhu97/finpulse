from datetime import datetime, timezone

import pytest

from src.api.v1.endpoints.common import now_utc


class TestNowUtc:
    """Tests for the now_utc utility function."""

    def test_now_utc_returns_utc_timezone(self) -> None:
        """Test that now_utc returns a datetime with UTC timezone."""
        result = now_utc()
        assert result.tzinfo == timezone.utc

    def test_now_utc_returns_datetime_instance(self) -> None:
        """Test that now_utc returns a datetime instance."""
        result = now_utc()
        assert isinstance(result, datetime)

    def test_now_utc_returns_reasonable_time(self) -> None:
        """Test that now_utc returns a time within a reasonable range."""
        result = now_utc()
        # Should be around 2024-2030
        assert 2024 <= result.year <= 2030

    def test_now_utc_returns_current_time(self) -> None:
        """Test that now_utc returns time close to system time."""
        before = datetime.now(timezone.utc)
        result = now_utc()
        after = datetime.now(timezone.utc)
        # Result should be between before and after
        assert before <= result <= after
