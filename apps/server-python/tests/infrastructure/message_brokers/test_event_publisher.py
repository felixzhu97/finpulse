from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from src.core.domain.events import DomainEvent, PortfolioEvent
from src.infrastructure.message_brokers.event_publisher import (
    EventPublisher,
    _to_kafka_value,
)


class TestEventPublisher:
    """Tests for the EventPublisher class."""

    @pytest.fixture
    def publisher(self) -> EventPublisher:
        """Create an EventPublisher instance."""
        return EventPublisher()

    def test_publish_non_portfolio_event_returns_early(
        self, publisher: EventPublisher
    ) -> None:
        """Test that non-PortfolioEvent is not published."""
        mock_event = MagicMock(spec=DomainEvent)
        mock_event.event_type = "test"

        with patch(
            "src.infrastructure.message_brokers.event_publisher._get_producer"
        ) as mock_get_producer:
            publisher.publish(mock_event)
            mock_get_producer.assert_not_called()

    def test_publish_batch_empty(self, publisher: EventPublisher) -> None:
        """Test publish_batch with empty event list."""
        with patch(
            "src.infrastructure.message_brokers.event_publisher._get_producer",
            return_value=MagicMock(),
        ):
            publisher.publish_batch([])


class TestToKafkaValue:
    """Tests for the _to_kafka_value function."""

    def test_to_kafka_value_returns_bytes(self) -> None:
        """Test that _to_kafka_value returns bytes."""
        event = PortfolioEvent.create(
            event_type="test_event",
            portfolio_id="test-portfolio",
            payload={"key": "value"},
        )

        result = _to_kafka_value(event)

        assert isinstance(result, bytes)

    def test_to_kafka_value_contains_event_data(self) -> None:
        """Test that _to_kafka_value contains correct event data."""
        import json

        event = PortfolioEvent.create(
            event_type="test_event",
            portfolio_id="test-portfolio",
            payload={"key": "value"},
        )

        result = _to_kafka_value(event)
        decoded = result.decode("utf-8")
        data = json.loads(decoded)

        assert data["type"] == "test_event"
        assert data["portfolio_id"] == "test-portfolio"
        assert data["payload"] == {"key": "value"}
