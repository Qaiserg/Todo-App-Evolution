"""Tests for TaskRepository (in-memory storage)."""

import pytest
from datetime import datetime
from src.models import Task, TaskStatus
from src.repository import TaskRepository


class TestTaskRepository:
    """Tests for TaskRepository CRUD operations."""

    def test_create_task_stores_in_repository(self, clean_repo):
        """Test that create() stores task in repository."""
        # Arrange
        task = Task(
            id=1,
            title="Buy milk",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        # Act
        created_task = clean_repo.create(task)

        # Assert
        assert created_task.id == 1
        assert created_task.title == "Buy milk"
        assert clean_repo.exists(1)

    def test_create_assigns_auto_incremented_id(self, clean_repo):
        """Test that IDs are auto-incremented."""
        # Arrange
        task1 = Task(id=0, title="Task 1", created_at=datetime.now(), updated_at=datetime.now())
        task2 = Task(id=0, title="Task 2", created_at=datetime.now(), updated_at=datetime.now())
        task3 = Task(id=0, title="Task 3", created_at=datetime.now(), updated_at=datetime.now())

        # Act
        created1 = clean_repo.create(task1)
        created2 = clean_repo.create(task2)
        created3 = clean_repo.create(task3)

        # Assert
        assert created1.id == 1
        assert created2.id == 2
        assert created3.id == 3

    def test_read_existing_task_returns_task(self, populated_repo):
        """Test that read() returns task if it exists."""
        # Act
        task = populated_repo.read(1)

        # Assert
        assert task is not None
        assert task.id == 1
        assert task.title == "Task 1"

    def test_read_nonexistent_task_returns_none(self, clean_repo):
        """Test that read() returns None for nonexistent task."""
        # Act
        task = clean_repo.read(999)

        # Assert
        assert task is None

    def test_read_all_returns_all_tasks(self, populated_repo):
        """Test that read_all() returns all tasks."""
        # Act
        tasks = populated_repo.read_all()

        # Assert
        assert len(tasks) == 3
        assert tasks[0].title == "Task 1"
        assert tasks[1].title == "Task 2"
        assert tasks[2].title == "Task 3"

    def test_read_all_empty_repository_returns_empty_list(self, clean_repo):
        """Test that read_all() returns empty list for empty repository."""
        # Act
        tasks = clean_repo.read_all()

        # Assert
        assert tasks == []
        assert len(tasks) == 0

    def test_update_existing_task_modifies_fields(self, populated_repo):
        """Test that update() modifies task fields."""
        # Arrange
        updates = {"title": "Updated Task 1", "description": "New description"}

        # Act
        updated_task = populated_repo.update(1, updates)

        # Assert
        assert updated_task is not None
        assert updated_task.title == "Updated Task 1"
        assert updated_task.description == "New description"
        assert updated_task.id == 1  # ID unchanged

    def test_update_nonexistent_task_returns_none(self, clean_repo):
        """Test that update() returns None for nonexistent task."""
        # Act
        result = clean_repo.update(999, {"title": "Updated"})

        # Assert
        assert result is None

    def test_update_sets_updated_at_timestamp(self, populated_repo):
        """Test that update() sets updated_at to current time."""
        # Arrange
        original_task = populated_repo.read(1)
        original_updated_at = original_task.updated_at
        import time
        time.sleep(0.01)  # Ensure time difference

        # Act
        updated_task = populated_repo.update(1, {"title": "New Title"})

        # Assert
        assert updated_task.updated_at > original_updated_at

    def test_delete_existing_task_removes_it(self, populated_repo):
        """Test that delete() removes task from repository."""
        # Arrange
        assert populated_repo.exists(1)

        # Act
        result = populated_repo.delete(1)

        # Assert
        assert result is True
        assert not populated_repo.exists(1)
        assert populated_repo.read(1) is None

    def test_delete_nonexistent_task_returns_false(self, clean_repo):
        """Test that delete() returns False for nonexistent task."""
        # Act
        result = clean_repo.delete(999)

        # Assert
        assert result is False

    def test_exists_returns_true_for_existing_task(self, populated_repo):
        """Test that exists() returns True for existing task."""
        # Act & Assert
        assert populated_repo.exists(1) is True
        assert populated_repo.exists(2) is True
        assert populated_repo.exists(3) is True

    def test_exists_returns_false_for_nonexistent_task(self, clean_repo):
        """Test that exists() returns False for nonexistent task."""
        # Act & Assert
        assert clean_repo.exists(1) is False
        assert clean_repo.exists(999) is False

    def test_repository_starts_with_id_1(self, clean_repo):
        """Test that repository ID counter starts at 1."""
        # Arrange
        task = Task(id=0, title="First Task", created_at=datetime.now(), updated_at=datetime.now())

        # Act
        created_task = clean_repo.create(task)

        # Assert
        assert created_task.id == 1
