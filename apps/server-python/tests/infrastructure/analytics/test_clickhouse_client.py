from datetime import date, datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from src.infrastructure.analytics.clickhouse_client import ClickHouseAnalyticsClient


class TestClickHouseAnalyticsClient:
    """Tests for the ClickHouseAnalyticsClient class."""

    @pytest.fixture
    def mock_client(self) -> MagicMock:
        """Create a mock ClickHouse client."""
        return MagicMock()

    @pytest.fixture
    def client(self, mock_client: MagicMock) -> ClickHouseAnalyticsClient:
        """Create a ClickHouseAnalyticsClient with mocked dependencies."""
        with patch(
            "src.infrastructure.analytics.clickhouse_client.clickhouse_connect.get_client",
            return_value=mock_client,
        ):
            client = ClickHouseAnalyticsClient(
                host="127.0.0.1",
                port=8123,
                database="analytics",
                username="default",
                password="",
            )
            client._client = mock_client
            return client

    def test_ensure_schema_creates_database_and_tables(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test that ensure_schema creates required database and tables."""
        with patch(
            "src.infrastructure.analytics.clickhouse_client.clickhouse_connect.get_client"
        ) as mock_get_client:
            temp_mock = MagicMock()
            mock_get_client.return_value = temp_mock
            client._client = None  # Reset to force new client

            client.ensure_schema()

            assert temp_mock.command.call_count >= 1

    def test_insert_portfolio_risk(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test inserting a single portfolio risk record."""
        client.insert_portfolio_risk(
            portfolio_id="test-portfolio",
            as_of_date=date(2024, 1, 15),
            var=-0.05,
            var_percent=-5.0,
            volatility=0.15,
            method="historical",
            confidence=0.95,
            sharpe_ratio=1.2,
        )

        mock_client.insert.assert_called_once()

    def test_insert_portfolio_risk_batch(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test inserting multiple portfolio risk records."""
        rows = [
            ("portfolio-1", date(2024, 1, 1), -0.05, -5.0, 0.15, 1.2, "historical", 0.95),
            ("portfolio-2", date(2024, 1, 2), -0.06, -6.0, 0.16, 1.1, "historical", 0.95),
        ]
        client.insert_portfolio_risk_batch(rows)

        mock_client.insert.assert_called_once()

    def test_insert_portfolio_risk_batch_empty(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test that empty batch does not call insert."""
        client.insert_portfolio_risk_batch([])

        mock_client.insert.assert_not_called()

    def test_query_executes_sql(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test that query executes the given SQL."""
        mock_result = MagicMock()
        mock_client.query.return_value = mock_result

        result = client.query("SELECT * FROM test_table")

        mock_client.query.assert_called_once_with(
            "SELECT * FROM test_table", parameters={}
        )
        assert result == mock_result

    def test_query_with_parameters(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test that query passes parameters."""
        mock_result = MagicMock()
        mock_client.query.return_value = mock_result

        params = {"limit": 10, "offset": 0}
        result = client.query("SELECT * FROM test LIMIT {limit}", parameters=params)

        mock_client.query.assert_called_once_with(
            "SELECT * FROM test LIMIT {limit}", parameters=params
        )
        assert result == mock_result

    def test_insert_delta_stats(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test inserting delta table stats."""
        client.insert_delta_stats(
            path="/data/table",
            row_count=1000,
            sample_json='{"col1": "value1"}',
        )

        mock_client.insert.assert_called_once()

    def test_get_latest_delta_stats(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test getting latest delta stats."""
        mock_result = MagicMock()
        mock_result.result_rows = [
            ("/data/table", 1000, '{"col1": "value1"}', datetime(2024, 1, 15))
        ]
        mock_client.query.return_value = mock_result

        result = client.get_latest_delta_stats()

        assert result is not None
        assert result["path"] == "/data/table"
        assert result["row_count"] == 1000

    def test_get_latest_delta_stats_with_path(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test getting latest delta stats for specific path."""
        mock_result = MagicMock()
        mock_result.result_rows = [
            ("/data/table2", 500, '{"col1": "value2"}', datetime(2024, 1, 16))
        ]
        mock_client.query.return_value = mock_result

        result = client.get_latest_delta_stats(path="/data/table2")

        assert result is not None
        assert result["path"] == "/data/table2"

    def test_get_latest_delta_stats_no_results(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test getting latest delta stats when no results exist."""
        mock_result = MagicMock()
        mock_result.result_rows = []
        mock_client.query.return_value = mock_result

        result = client.get_latest_delta_stats()

        assert result is None

    def test_get_portfolio_risk(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test getting portfolio risk data."""
        mock_result = MagicMock()
        mock_result.column_names = ["portfolio_id", "as_of_date", "var", "var_percent"]
        mock_result.result_rows = [
            ("p1", date(2024, 1, 1), -0.05, -5.0),
            ("p2", date(2024, 1, 2), -0.06, -6.0),
        ]
        mock_client.query.return_value = mock_result

        result = client.get_portfolio_risk()

        assert len(result) == 2
        assert result[0]["portfolio_id"] == "p1"

    def test_get_portfolio_risk_with_portfolio_id(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test getting portfolio risk for specific portfolio."""
        mock_result = MagicMock()
        mock_result.column_names = ["portfolio_id", "as_of_date", "var", "var_percent"]
        mock_result.result_rows = [("p1", date(2024, 1, 1), -0.05, -5.0)]
        mock_client.query.return_value = mock_result

        result = client.get_portfolio_risk(portfolio_id="p1")

        assert len(result) == 1
        assert result[0]["portfolio_id"] == "p1"

    def test_get_portfolio_risk_with_limit(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test getting portfolio risk with custom limit."""
        mock_result = MagicMock()
        mock_result.column_names = ["portfolio_id"]
        mock_result.result_rows = [("p1",), ("p2",)]
        mock_client.query.return_value = mock_result

        result = client.get_portfolio_risk(limit=2)

        mock_client.query.assert_called_once()

    def test_close_with_client(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test closing client with active connection."""
        client.close()

        mock_client.close.assert_called_once()
        assert client._client is None

    def test_close_without_client(
        self, client: ClickHouseAnalyticsClient, mock_client: MagicMock
    ) -> None:
        """Test closing client without active connection."""
        client._client = None
        mock_client.reset_mock()

        client.close()

        mock_client.close.assert_not_called()

    def test_client_uses_env_defaults(self) -> None:
        """Test that client uses environment variable defaults."""
        with patch.dict(
            "os.environ",
            {
                "CLICKHOUSE_HOST": "env-host",
                "CLICKHOUSE_PORT": "8124",
                "CLICKHOUSE_DATABASE": "env-db",
                "CLICKHOUSE_USER": "env-user",
                "CLICKHOUSE_PASSWORD": "env-pass",
            },
        ):
            with patch(
                "src.infrastructure.analytics.clickhouse_client.clickhouse_connect.get_client"
            ):
                client = ClickHouseAnalyticsClient()

                assert client._host == "env-host"
                assert client._port == 8124
                assert client._database == "env-db"
                assert client._username == "env-user"
