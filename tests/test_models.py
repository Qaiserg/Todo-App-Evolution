"""Tests for SQLModel Task model."""

import pytest
from datetime import datetime
from pydantic import ValidationError
from src.models import Task, TaskStatus


class TestTaskModel:
    """Tests for Task SQLModel model validation."""

    def test_create_task_with_valid_title_only(self):
        """Test that creating a task with only a title succeeds."""
        # Arrange & Act
        task = Task(title="Buy groceries")

        # Assert
        assert task.id is None  # Not yet saved to DB
        assert task.title == "Buy groceries"
        assert task.description is None
        assert task.status == TaskStatus.PENDING
        assert isinstance(task.created_at, datetime)
        assert isinstance(task.updated_at, datetime)

    def test_create_task_with_title_and_description(self):
        """Test that creating a task with title and description succeeds."""
        # Arrange & Act
        task = Task(
            title="Finish homework",
            description="Complete math assignment pages 45-50"
        )

        # Assert
        assert task.title == "Finish homework"
        assert task.description == "Complete math assignment pages 45-50"
        assert task.status == TaskStatus.PENDING

    def test_task_defaults_to_pending_status(self):
        """Test that new tasks default to PENDING status."""
        # Arrange & Act
        task = Task(title="Test Task")

        # Assert
        assert task.status == TaskStatus.PENDING

    def test_empty_title_raises_validation_error(self):
        """Test that empty title raises ValidationError."""
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            Task(title="")

        # Verify error message mentions title
        assert "title" in str(exc_info.value).lower()

    def test_title_exceeding_200_chars_raises_validation_error(self):
        """Test that title over 200 characters raises ValidationError."""
        # Arrange
        long_title = "a" * 201

        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            Task(title=long_title)

        # Verify error mentions title length
        assert "title" in str(exc_info.value).lower()

    def test_title_at_200_chars_boundary_is_accepted(self):
        """Test that exactly 200-character title is accepted (boundary test)."""
        # Arrange
        boundary_title = "a" * 200

        # Act
        task = Task(title=boundary_title)

        # Assert
        assert len(task.title) == 200
        assert task.title == boundary_title

    def test_description_exceeding_1000_chars_raises_validation_error(self):
        """Test that description over 1000 characters raises ValidationError."""
        # Arrange
        long_description = "a" * 1001

        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            Task(title="Valid title", description=long_description)

        # Verify error mentions description
        assert "description" in str(exc_info.value).lower()

    def test_description_at_1000_chars_boundary_is_accepted(self):
        """Test that exactly 1000-character description is accepted (boundary test)."""
        # Arrange
        boundary_description = "a" * 1000

        # Act
        task = Task(title="Valid title", description=boundary_description)

        # Assert
        assert len(task.description) == 1000
        assert task.description == boundary_description

    def test_none_description_is_accepted(self):
        """Test that None description is valid (optional field)."""
        # Act
        task = Task(title="Task without description", description=None)

        # Assert
        assert task.description is None


class TestTaskStatusEnum:
    """Tests for TaskStatus enum."""

    def test_task_status_pending_value(self):
        """Test that PENDING status has correct value."""
        assert TaskStatus.PENDING == "pending"

    def test_task_status_completed_value(self):
        """Test that COMPLETED status has correct value."""
        assert TaskStatus.COMPLETED == "completed"

    def test_task_can_be_marked_completed(self):
        """Test that task status can be changed to COMPLETED."""
        # Arrange
        task = Task(title="Test Task", status=TaskStatus.PENDING)

        # Act
        task.status = TaskStatus.COMPLETED

        # Assert
        assert task.status == TaskStatus.COMPLETED
