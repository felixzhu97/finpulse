import pytest


class TestRepository:
    """Tests for the Repository base class."""

    def test_repository_is_generic(self) -> None:
        """Test that Repository is a Generic type."""
        from typing import Generic
        from src.core.shared.base import Repository
        # Repository should be a Generic type
        assert hasattr(Repository, "__parameters__")

    def test_repository_can_be_specialized(self) -> None:
        """Test that Repository can be specialized with a type."""
        from src.core.shared.base import Repository
        repo_type = Repository[str]
        # Should be able to create a specialized repository type
        assert repo_type is not None
