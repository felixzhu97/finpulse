from unittest.mock import MagicMock

import pytest

from src.infrastructure.market_data.kafka_quote_producer import KafkaQuoteProducer


class TestKafkaQuoteProducer:
    """Tests for the KafkaQuoteProducer class."""

    def test_is_available_when_no_producer(self) -> None:
        """Test is_available returns False when no producer."""
        producer = KafkaQuoteProducer.__new__(KafkaQuoteProducer)
        producer._producer = None

        assert producer.is_available() is False

    def test_publish_quotes_returns_false_when_no_producer(self) -> None:
        """Test publish_quotes returns False when no producer."""
        producer = KafkaQuoteProducer.__new__(KafkaQuoteProducer)
        producer._producer = None

        result = producer.publish_quotes({})

        assert result is False

    def test_publish_quotes_returns_false_when_empty_quotes(self) -> None:
        """Test publish_quotes returns False for empty quotes."""
        producer = KafkaQuoteProducer.__new__(KafkaQuoteProducer)
        producer._producer = MagicMock()

        result = producer.publish_quotes({})

        assert result is False

    def test_publish_quotes_success(self) -> None:
        """Test successful quote publishing."""
        producer = KafkaQuoteProducer.__new__(KafkaQuoteProducer)
        producer._producer = MagicMock()

        quotes = {
            "AAPL": (150.0, 2.5, 0.017, 1000000),
            "MSFT": (300.0, 5.0, 0.017, 2000000),
        }

        result = producer.publish_quotes(quotes)

        assert result is True
        producer._producer.produce.assert_called()
        producer._producer.flush.assert_called_once_with(1.0)

    def test_publish_quotes_handles_producer_error(self) -> None:
        """Test that publish_quotes handles producer errors."""
        producer = KafkaQuoteProducer.__new__(KafkaQuoteProducer)
        producer._producer = MagicMock()
        producer._producer.produce.side_effect = Exception("Kafka error")

        quotes = {"AAPL": (150.0, 2.5, 0.017, 1000000)}

        result = producer.publish_quotes(quotes)

        assert result is False
