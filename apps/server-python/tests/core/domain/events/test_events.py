import pytest
from datetime import datetime, timezone
from uuid import UUID

from src.core.domain.events import PortfolioEvent


class TestPortfolioEvent:
    def test_create_portfolio_event(self):
        event = PortfolioEvent.create(
            event_type="portfolio.created",
            portfolio_id="portfolio-123",
            payload={"total": 100000},
        )
        
        assert event.event_type == "portfolio.created"
        assert event.portfolio_id == "portfolio-123"
        assert event.payload == {"total": 100000}
        assert event.event_id is not None
        assert event.occurred_at is not None
        assert event.aggregate_id == "portfolio-123"

    def test_portfolio_event_unique_ids(self):
        event1 = PortfolioEvent.create("type1", "p1", {})
        event2 = PortfolioEvent.create("type2", "p2", {})
        
        assert event1.event_id != event2.event_id

    def test_portfolio_event_different_types(self):
        created = PortfolioEvent.create("portfolio.created", "p1", {"action": "create"})
        updated = PortfolioEvent.create("portfolio.updated", "p1", {"action": "update"})
        seeded = PortfolioEvent.create("portfolio.seeded", "p1", {"action": "seed"})
        
        assert created.event_type == "portfolio.created"
        assert updated.event_type == "portfolio.updated"
        assert seeded.event_type == "portfolio.seeded"

    def test_portfolio_event_payload_types(self):
        event_dict = PortfolioEvent.create("test", "p1", {"key": "value"})
        assert event_dict.payload == {"key": "value"}
        
        event_list = PortfolioEvent.create("test", "p1", [1, 2, 3])
        assert event_list.payload == [1, 2, 3]
        
        event_empty = PortfolioEvent.create("test", "p1", {})
        assert event_empty.payload == {}

    def test_portfolio_event_occurred_at_is_utc(self):
        event = PortfolioEvent.create("test", "p1", {})
        assert event.occurred_at.tzinfo is not None
