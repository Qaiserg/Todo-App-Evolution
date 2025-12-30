"""Tests for TaskService (business logic)."""

import pytest
from pydantic import ValidationError
from src.service import TaskService
from src.models import TaskStatus


class TestAddTask:
    """Tests for add_task functionality."""

    def test_add_task_with_title_only_creates_task(self, service):
        """Test that adding a task with only a title succeeds."""
        # Arrange
        title = "Buy groceries"

        # Act
        result = service.add_task(title=title)

        # Assert
        assert result["success"] is True
        assert result["task"].title == title
        assert result["task"].description is None
        assert result["task"].status == TaskStatus.PENDING
        assert result["task"].id == 1
        assert "message" in result
        assert title in result["message"]

    def test_add_task_with_title_and_description_creates_task(self, service):
        """Test that adding a task with title and description succeeds."""
        # Arrange
        title = "Finish homework"
        description = "Complete math assignment pages 45-50"

        # Act
        result = service.add_task(title=title, description=description)

        # Assert
        assert result["success"] is True
        assert result["task"].title == title
        assert result["task"].description == description
        assert result["task"].id == 1

    def test_add_task_assigns_auto_incremented_id(self, service):
        """Test that task IDs are auto-incremented."""
        # Act
        task1 = service.add_task(title="Task 1")
        task2 = service.add_task(title="Task 2")
        task3 = service.add_task(title="Task 3")

        # Assert
        assert task1["task"].id == 1
        assert task2["task"].id == 2
        assert task3["task"].id == 3

    def test_add_task_sets_created_timestamp(self, service):
        """Test that created_at timestamp is set."""
        # Act
        result = service.add_task(title="Test Task")

        # Assert
        assert result["task"].created_at is not None
        assert result["task"].updated_at is not None

    def test_add_task_with_empty_title_returns_error(self, service):
        """Test that empty title returns error response."""
        # Act
        result = service.add_task(title="")

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "title" in result["error"].lower()

    def test_add_task_with_title_exceeding_200_chars_returns_error(self, service):
        """Test that title over 200 characters returns error."""
        # Arrange
        long_title = "a" * 201

        # Act
        result = service.add_task(title=long_title)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "title" in result["error"].lower() or "200" in result["error"]

    def test_add_task_with_max_length_title_succeeds(self, service):
        """Test that 200-character title is accepted (boundary test)."""
        # Arrange
        max_title = "a" * 200

        # Act
        result = service.add_task(title=max_title)

        # Assert
        assert result["success"] is True
        assert len(result["task"].title) == 200

    def test_add_task_with_description_exceeding_1000_chars_returns_error(self, service):
        """Test that description over 1000 chars returns error."""
        # Arrange
        title = "Valid title"
        long_description = "a" * 1001

        # Act
        result = service.add_task(title=title, description=long_description)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "description" in result["error"].lower() or "1000" in result["error"]

    def test_add_task_with_max_length_description_succeeds(self, service):
        """Test that 1000-character description is accepted (boundary test)."""
        # Arrange
        title = "Valid title"
        max_description = "a" * 1000

        # Act
        result = service.add_task(title=title, description=max_description)

        # Assert
        assert result["success"] is True
        assert len(result["task"].description) == 1000

    def test_add_task_returns_success_message(self, service):
        """Test that success response includes message with task details."""
        # Act
        result = service.add_task(title="Test Task")

        # Assert
        assert result["success"] is True
        assert "message" in result
        assert "Test Task" in result["message"]
        assert str(result["task"].id) in result["message"]
        assert "created successfully" in result["message"].lower()

    def test_add_task_with_none_description_succeeds(self, service):
        """Test that None description is valid."""
        # Act
        result = service.add_task(title="Task", description=None)

        # Assert
        assert result["success"] is True
        assert result["task"].description is None

    def test_add_multiple_tasks_all_stored(self, service):
        """Test that multiple tasks can be added and all are stored."""
        # Act
        service.add_task(title="Task 1")
        service.add_task(title="Task 2")
        service.add_task(title="Task 3")

        # Assert - via repository
        all_tasks = service._repo.read_all()
        assert len(all_tasks) == 3


class TestDeleteTask:
    """Tests for delete_task functionality."""

    def test_delete_existing_task_removes_it(self, service):
        """Test that deleting an existing task removes it from repository."""
        # Arrange
        task = service.add_task(title="Task to delete")
        task_id = task["task"].id

        # Act
        result = service.delete_task(task_id)

        # Assert
        assert result["success"] is True
        assert not service._repo.exists(task_id)

    def test_delete_task_returns_task_details(self, service):
        """Test that delete response includes task ID and title."""
        # Arrange
        task = service.add_task(title="Call dentist")
        task_id = task["task"].id

        # Act
        result = service.delete_task(task_id)

        # Assert
        assert result["success"] is True
        assert "message" in result
        assert "Call dentist" in result["message"]
        assert str(task_id) in result["message"]

    def test_delete_nonexistent_task_returns_error(self, service):
        """Test that deleting non-existent task returns error."""
        # Act
        result = service.delete_task(999)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "not found" in result["error"].lower()

    def test_delete_with_zero_id_returns_error(self, service):
        """Test that zero ID returns error."""
        # Act
        result = service.delete_task(0)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "positive" in result["error"].lower()

    def test_delete_with_negative_id_returns_error(self, service):
        """Test that negative ID returns error."""
        # Act
        result = service.delete_task(-5)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "positive" in result["error"].lower()

    def test_repository_count_decreases_after_deletion(self, service):
        """Test that repository count decreases after deletion."""
        # Arrange
        for i in range(5):
            service.add_task(title=f"Task {i+1}")

        # Act
        service.delete_task(3)

        # Assert
        all_tasks = service._repo.read_all()
        assert len(all_tasks) == 4

    def test_other_tasks_unchanged_after_deletion(self, service):
        """Test that other tasks remain unchanged after deletion."""
        # Arrange
        task1 = service.add_task(title="Task 1")["task"]
        task2 = service.add_task(title="Task 2")["task"]
        task3 = service.add_task(title="Task 3")["task"]

        # Act
        service.delete_task(task2.id)

        # Assert
        assert service._repo.exists(task1.id)
        assert not service._repo.exists(task2.id)
        assert service._repo.exists(task3.id)
        assert service._repo.read(task1.id).title == "Task 1"
        assert service._repo.read(task3.id).title == "Task 3"

    def test_delete_only_task_empties_repository(self, service):
        """Test that deleting the only task empties repository."""
        # Arrange
        task = service.add_task(title="Only task")
        task_id = task["task"].id

        # Act
        service.delete_task(task_id)

        # Assert
        all_tasks = service._repo.read_all()
        assert len(all_tasks) == 0

    def test_delete_from_empty_repository_returns_error(self, service):
        """Test that deleting from empty repository returns error."""
        # Act
        result = service.delete_task(1)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "not found" in result["error"].lower()

    def test_delete_returns_success_message(self, service):
        """Test that success response includes descriptive message."""
        # Arrange
        task = service.add_task(title="Test Task")
        task_id = task["task"].id

        # Act
        result = service.delete_task(task_id)

        # Assert
        assert result["success"] is True
        assert "message" in result
        assert "deleted successfully" in result["message"].lower()


class TestUpdateTask:
    """Tests for update_task functionality."""

    def test_update_task_title_changes_title_and_updates_timestamp(self, service):
        """Test that updating title changes title and updates timestamp."""
        # Arrange
        task = service.add_task(title="Old title")
        task_id = task["task"].id
        original_created_at = task["task"].created_at
        original_updated_at = task["task"].updated_at

        # Act
        result = service.update_task(task_id, title="New title")

        # Assert
        assert result["success"] is True
        assert result["task"].title == "New title"
        assert result["task"].created_at == original_created_at
        assert result["task"].updated_at > original_updated_at

    def test_update_task_description_changes_description(self, service):
        """Test that updating description changes description only."""
        # Arrange
        task = service.add_task(title="Task", description="Old desc")
        task_id = task["task"].id
        original_title = task["task"].title

        # Act
        result = service.update_task(task_id, description="New description")

        # Assert
        assert result["success"] is True
        assert result["task"].description == "New description"
        assert result["task"].title == original_title

    def test_update_task_status_changes_status(self, service):
        """Test that updating status changes status."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id

        # Act
        result = service.update_task(task_id, status=TaskStatus.COMPLETED)

        # Assert
        assert result["success"] is True
        assert result["task"].status == TaskStatus.COMPLETED

    def test_update_multiple_fields_changes_all_provided_fields(self, service):
        """Test that updating multiple fields changes all of them."""
        # Arrange
        task = service.add_task(title="Old", description="Old desc")
        task_id = task["task"].id

        # Act
        result = service.update_task(
            task_id,
            title="New title",
            description="New desc",
            status=TaskStatus.COMPLETED
        )

        # Assert
        assert result["success"] is True
        assert result["task"].title == "New title"
        assert result["task"].description == "New desc"
        assert result["task"].status == TaskStatus.COMPLETED

    def test_update_description_to_none_clears_description(self, service):
        """Test that setting description to None clears it."""
        # Arrange
        task = service.add_task(title="Task", description="Old desc")
        task_id = task["task"].id

        # Act
        result = service.update_task(task_id, description=None)

        # Assert
        assert result["success"] is True
        assert result["task"].description is None

    def test_update_nonexistent_task_returns_error(self, service):
        """Test that updating non-existent task returns error."""
        # Act
        result = service.update_task(999, title="New")

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "not found" in result["error"].lower()

    def test_update_with_empty_title_returns_error(self, service):
        """Test that empty title returns error."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id

        # Act
        result = service.update_task(task_id, title="")

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "title" in result["error"].lower()

    def test_update_with_title_exceeding_200_chars_returns_error(self, service):
        """Test that title over 200 chars returns error."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        long_title = "a" * 201

        # Act
        result = service.update_task(task_id, title=long_title)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "title" in result["error"].lower() or "200" in result["error"]

    def test_update_with_description_exceeding_1000_chars_returns_error(self, service):
        """Test that description over 1000 chars returns error."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        long_description = "a" * 1001

        # Act
        result = service.update_task(task_id, description=long_description)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "description" in result["error"].lower() or "1000" in result["error"]

    def test_update_with_zero_id_returns_error(self, service):
        """Test that zero ID returns error."""
        # Act
        result = service.update_task(0, title="New")

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "positive" in result["error"].lower()

    def test_update_with_negative_id_returns_error(self, service):
        """Test that negative ID returns error."""
        # Act
        result = service.update_task(-5, title="New")

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "positive" in result["error"].lower()

    def test_update_created_at_remains_unchanged(self, service):
        """Test that created_at never changes during update."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        original_created_at = task["task"].created_at

        # Act
        result = service.update_task(task_id, title="New title")

        # Assert
        assert result["success"] is True
        assert result["task"].created_at == original_created_at
        assert result["task"].updated_at > original_created_at

    def test_update_with_no_fields_returns_error(self, service):
        """Test that update with no fields returns error."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id

        # Act
        result = service.update_task(task_id)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "no fields" in result["error"].lower() or "required" in result["error"].lower()

    def test_update_with_max_length_title_succeeds(self, service):
        """Test that 200-character title is accepted."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        max_title = "a" * 200

        # Act
        result = service.update_task(task_id, title=max_title)

        # Assert
        assert result["success"] is True
        assert len(result["task"].title) == 200

    def test_update_with_max_length_description_succeeds(self, service):
        """Test that 1000-character description is accepted."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        max_description = "a" * 1000

        # Act
        result = service.update_task(task_id, description=max_description)

        # Assert
        assert result["success"] is True
        assert len(result["task"].description) == 1000


class TestViewTasks:
    """Tests for view_tasks functionality."""

    def test_view_all_tasks_returns_all_tasks_from_repository(self, service):
        """Test that view_tasks returns all tasks from repository."""
        # Arrange
        service.add_task(title="Task 1")
        service.add_task(title="Task 2")
        service.add_task(title="Task 3")
        service.update_task(2, status=TaskStatus.COMPLETED)  # Make task 2 completed

        # Act
        result = service.view_tasks()

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 3

    def test_view_pending_tasks_returns_only_pending_tasks(self, service):
        """Test that filtering by pending returns only pending tasks."""
        # Arrange
        service.add_task(title="Pending 1")
        service.add_task(title="Completed 1")
        service.add_task(title="Pending 2")
        service.update_task(2, status=TaskStatus.COMPLETED)

        # Act
        result = service.view_tasks(status=TaskStatus.PENDING)

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 2
        assert all(task.status == TaskStatus.PENDING for task in result["tasks"])

    def test_view_completed_tasks_returns_only_completed_tasks(self, service):
        """Test that filtering by completed returns only completed tasks."""
        # Arrange
        service.add_task(title="Pending 1")
        service.add_task(title="Completed 1")
        service.add_task(title="Completed 2")
        service.update_task(2, status=TaskStatus.COMPLETED)
        service.update_task(3, status=TaskStatus.COMPLETED)

        # Act
        result = service.view_tasks(status=TaskStatus.COMPLETED)

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 2
        assert all(task.status == TaskStatus.COMPLETED for task in result["tasks"])

    def test_view_tasks_on_empty_repository_returns_empty_list(self, service):
        """Test that view_tasks on empty repository returns empty list."""
        # Act
        result = service.view_tasks()

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 0
        assert result["tasks"] == []

    def test_view_pending_tasks_when_none_exist_returns_empty_list(self, service):
        """Test that filtering by pending when none exist returns empty list."""
        # Arrange
        service.add_task(title="Task 1")
        service.add_task(title="Task 2")
        service.update_task(1, status=TaskStatus.COMPLETED)
        service.update_task(2, status=TaskStatus.COMPLETED)

        # Act
        result = service.view_tasks(status=TaskStatus.PENDING)

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 0

    def test_view_completed_tasks_when_none_exist_returns_empty_list(self, service):
        """Test that filtering by completed when none exist returns empty list."""
        # Arrange
        service.add_task(title="Task 1")
        service.add_task(title="Task 2")

        # Act
        result = service.view_tasks(status=TaskStatus.COMPLETED)

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 0

    def test_tasks_are_sorted_by_id_in_ascending_order(self, service):
        """Test that tasks are returned sorted by ID."""
        # Arrange
        t1 = service.add_task(title="Task 1")  # ID 1
        t2 = service.add_task(title="Task 2")  # ID 2
        t3 = service.add_task(title="Task 3")  # ID 3
        service.delete_task(2)  # Delete task 2
        t4 = service.add_task(title="Task 4")  # ID 4

        # Act
        result = service.view_tasks()

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 3
        assert result["tasks"][0].id == 1
        assert result["tasks"][1].id == 3
        assert result["tasks"][2].id == 4

    def test_view_tasks_includes_all_task_fields(self, service):
        """Test that returned tasks have all required fields."""
        # Arrange
        service.add_task(title="Test Task", description="Test description")

        # Act
        result = service.view_tasks()

        # Assert
        assert result["success"] is True
        task = result["tasks"][0]
        assert hasattr(task, "id")
        assert hasattr(task, "title")
        assert hasattr(task, "description")
        assert hasattr(task, "status")
        assert hasattr(task, "created_at")
        assert hasattr(task, "updated_at")

    def test_view_tasks_handles_none_descriptions(self, service):
        """Test that tasks with None descriptions are included."""
        # Arrange
        service.add_task(title="With desc", description="Has description")
        service.add_task(title="Without desc")  # description=None

        # Act
        result = service.view_tasks()

        # Assert
        assert result["success"] is True
        assert len(result["tasks"]) == 2
        assert result["tasks"][0].description == "Has description"
        assert result["tasks"][1].description is None

    def test_view_returns_success_response_with_task_list(self, service):
        """Test that view_tasks returns proper response structure."""
        # Arrange
        service.add_task(title="Task 1")
        service.add_task(title="Task 2")

        # Act
        result = service.view_tasks()

        # Assert
        assert "success" in result
        assert "tasks" in result
        assert result["success"] is True
        assert isinstance(result["tasks"], list)
        assert len(result["tasks"]) == 2


class TestMarkComplete:
    """Tests for mark_complete functionality."""

    def test_mark_pending_task_as_complete_changes_status(self, service):
        """Test that marking pending task changes status to completed."""
        # Arrange
        task = service.add_task(title="Buy groceries")
        task_id = task["task"].id
        assert task["task"].status == TaskStatus.PENDING

        # Act
        result = service.mark_complete(task_id)

        # Assert
        assert result["success"] is True
        assert result["task"].status == TaskStatus.COMPLETED

    def test_mark_complete_updates_updated_at_timestamp(self, service):
        """Test that mark_complete updates the updated_at timestamp."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        original_updated_at = task["task"].updated_at

        # Act
        result = service.mark_complete(task_id)

        # Assert
        assert result["success"] is True
        assert result["task"].updated_at > original_updated_at

    def test_mark_complete_does_not_change_other_fields(self, service):
        """Test that mark_complete only changes status and updated_at."""
        # Arrange
        task = service.add_task(title="Original Title", description="Original Description")
        task_id = task["task"].id
        original_title = task["task"].title
        original_description = task["task"].description
        original_created_at = task["task"].created_at

        # Act
        result = service.mark_complete(task_id)

        # Assert
        assert result["success"] is True
        assert result["task"].title == original_title
        assert result["task"].description == original_description
        assert result["task"].created_at == original_created_at

    def test_mark_already_completed_task_succeeds_idempotent(self, service):
        """Test that marking already completed task succeeds."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        service.mark_complete(task_id)  # Mark complete first time

        # Act
        result = service.mark_complete(task_id)  # Mark complete second time

        # Assert
        assert result["success"] is True
        assert result["task"].status == TaskStatus.COMPLETED

    def test_mark_complete_on_nonexistent_task_returns_error(self, service):
        """Test that marking non-existent task returns error."""
        # Act
        result = service.mark_complete(999)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "not found" in result["error"].lower()

    def test_mark_complete_with_zero_id_returns_error(self, service):
        """Test that zero ID returns error."""
        # Act
        result = service.mark_complete(0)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "positive" in result["error"].lower()

    def test_mark_complete_with_negative_id_returns_error(self, service):
        """Test that negative ID returns error."""
        # Act
        result = service.mark_complete(-5)

        # Assert
        assert result["success"] is False
        assert "error" in result
        assert "positive" in result["error"].lower()

    def test_mark_complete_returns_task_in_response(self, service):
        """Test that mark_complete returns updated task object."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id

        # Act
        result = service.mark_complete(task_id)

        # Assert
        assert result["success"] is True
        assert "task" in result
        assert result["task"].id == task_id

    def test_mark_complete_returns_success_message_with_task_details(self, service):
        """Test that success message includes task ID and title."""
        # Arrange
        task = service.add_task(title="Finish report")
        task_id = task["task"].id

        # Act
        result = service.mark_complete(task_id)

        # Assert
        assert result["success"] is True
        assert "message" in result
        assert "Finish report" in result["message"] or str(task_id) in result["message"]

    def test_mark_complete_preserves_created_at_timestamp(self, service):
        """Test that created_at timestamp is not changed."""
        # Arrange
        task = service.add_task(title="Task")
        task_id = task["task"].id
        original_created_at = task["task"].created_at

        # Act
        result = service.mark_complete(task_id)

        # Assert
        assert result["success"] is True
        assert result["task"].created_at == original_created_at
        assert result["task"].updated_at > original_created_at
