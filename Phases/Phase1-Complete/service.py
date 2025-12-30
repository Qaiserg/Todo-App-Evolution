"""Service layer for task business logic."""

from datetime import datetime
from pydantic import ValidationError
from src.models import Task, TaskStatus
from src.repository import TaskRepository

# Sentinel value to distinguish "not provided" from "explicitly None"
_UNSET = object()


class TaskService:
    """Service layer for task operations.

    This layer contains business logic and orchestrates operations
    between the repository and the presentation layer (CLI).

    Attributes:
        _repo: TaskRepository instance for data persistence
    """

    def __init__(self, repository: TaskRepository) -> None:
        """Initialize the task service.

        Args:
            repository: TaskRepository instance to use for storage
        """
        self._repo = repository

    def add_task(self, title: str, description: str | None = None) -> dict:
        """Add a new task to the repository.

        Args:
            title: Task title (required, 1-200 characters)
            description: Optional task description (max 1000 characters)

        Returns:
            Dictionary with:
                - success (bool): True if task was created, False if validation failed
                - task (Task): The created task object (if successful)
                - message (str): Success or error message
                - error (str): Error details (if failed)

        Examples:
            >>> service.add_task("Buy groceries")
            {
                "success": True,
                "task": Task(...),
                "message": "Task 'Buy groceries' (ID: 1) created successfully"
            }

            >>> service.add_task("")
            {
                "success": False,
                "error": "Title is required and must be between 1 and 200 characters",
                "message": "Validation failed"
            }
        """
        try:
            # Create task with current timestamps
            now = datetime.now()
            task = Task(
                id=0,  # Will be auto-assigned by repository
                title=title,
                description=description,
                status=TaskStatus.PENDING,
                created_at=now,
                updated_at=now
            )

            # Save to repository
            created_task = self._repo.create(task)

            return {
                "success": True,
                "task": created_task,
                "message": f"Task '{created_task.title}' (ID: {created_task.id}) created successfully"
            }

        except ValidationError as e:
            # Extract user-friendly error message
            error_msg = self._format_validation_error(e)
            return {
                "success": False,
                "error": error_msg,
                "message": "Validation failed"
            }

    def _format_validation_error(self, error: ValidationError) -> str:
        """Format Pydantic validation error into user-friendly message.

        Args:
            error: Pydantic ValidationError

        Returns:
            User-friendly error message string
        """
        errors = error.errors()
        if not errors:
            return "Validation error occurred"

        first_error = errors[0]
        field = first_error.get("loc", [""])[0]
        error_type = first_error.get("type", "")

        # Custom messages for common validation errors
        if field == "title":
            if "string_too_short" in error_type or "missing" in error_type:
                return "Title is required and must be between 1 and 200 characters"
            elif "string_too_long" in error_type:
                return "Title must not exceed 200 characters"
        elif field == "description":
            if "string_too_long" in error_type:
                return "Description must not exceed 1000 characters"

        # Fallback to Pydantic's error message
        return first_error.get("msg", "Validation error occurred")

    def delete_task(self, task_id: int) -> dict:
        """Delete a task from the repository.

        Args:
            task_id: The ID of the task to delete

        Returns:
            Dictionary with:
                - success (bool): True if task was deleted, False if not found or invalid
                - message (str): Success or error message
                - error (str): Error details (if failed)

        Examples:
            >>> service.delete_task(5)
            {
                "success": True,
                "message": "Task 'Buy groceries' (ID: 5) deleted successfully"
            }

            >>> service.delete_task(999)
            {
                "success": False,
                "error": "Task with ID 999 not found",
                "message": "Deletion failed"
            }
        """
        # Validate task ID is positive
        if task_id <= 0:
            return {
                "success": False,
                "error": "Task ID must be a positive number",
                "message": "Invalid task ID"
            }

        # Check if task exists
        if not self._repo.exists(task_id):
            return {
                "success": False,
                "error": f"Task with ID {task_id} not found",
                "message": "Deletion failed"
            }

        # Get task details before deletion (for confirmation message)
        task = self._repo.read(task_id)
        task_title = task.title if task else "Unknown"

        # Delete the task
        deleted = self._repo.delete(task_id)

        if deleted:
            return {
                "success": True,
                "message": f"Task '{task_title}' (ID: {task_id}) deleted successfully"
            }
        else:
            return {
                "success": False,
                "error": f"Failed to delete task with ID {task_id}",
                "message": "Deletion failed"
            }

    def update_task(
        self,
        task_id: int,
        title: str | None | object = _UNSET,
        description: str | None | object = _UNSET,
        status: TaskStatus | None | object = _UNSET
    ) -> dict:
        """Update a task in the repository.

        Args:
            task_id: The ID of the task to update
            title: Optional new title (1-200 characters), or _UNSET if not updating
            description: Optional new description (max 1000 characters, None to clear), or _UNSET if not updating
            status: Optional new status (PENDING or COMPLETED), or _UNSET if not updating

        Returns:
            Dictionary with:
                - success (bool): True if task was updated, False if not found or invalid
                - task (Task): The updated task object (if successful)
                - message (str): Success or error message
                - error (str): Error details (if failed)

        Examples:
            >>> service.update_task(5, title="New title")
            {
                "success": True,
                "task": Task(...),
                "message": "Task 5 updated successfully"
            }

            >>> service.update_task(999, title="New")
            {
                "success": False,
                "error": "Task with ID 999 not found",
                "message": "Update failed"
            }
        """
        # Validate task ID is positive
        if task_id <= 0:
            return {
                "success": False,
                "error": "Task ID must be a positive number",
                "message": "Invalid task ID"
            }

        # Check that at least one field is provided
        if title is _UNSET and description is _UNSET and status is _UNSET:
            return {
                "success": False,
                "error": "No fields provided for update",
                "message": "Update failed"
            }

        # Check if task exists
        if not self._repo.exists(task_id):
            return {
                "success": False,
                "error": f"Task with ID {task_id} not found",
                "message": "Update failed"
            }

        # Get current task
        current_task = self._repo.read(task_id)
        if not current_task:
            return {
                "success": False,
                "error": f"Failed to retrieve task with ID {task_id}",
                "message": "Update failed"
            }

        try:
            # Build updates dictionary with only provided fields
            # Use sentinel _UNSET to distinguish "not provided" from "explicitly None"
            now = datetime.now()
            updates = {}

            if title is not _UNSET:
                updates["title"] = title
            if description is not _UNSET:
                updates["description"] = description
            if status is not _UNSET:
                updates["status"] = status

            # Always update the timestamp
            updates["updated_at"] = now

            # Validate the updates by creating a temporary task object
            # This ensures Pydantic validation is applied
            temp_task = Task(
                id=current_task.id,
                title=updates.get("title", current_task.title),
                description=updates.get("description", current_task.description),
                status=updates.get("status", current_task.status),
                created_at=current_task.created_at,
                updated_at=now
            )

            # Save to repository
            saved_task = self._repo.update(task_id, updates)

            if saved_task:
                return {
                    "success": True,
                    "task": saved_task,
                    "message": f"Task {task_id} updated successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to update task with ID {task_id}",
                    "message": "Update failed"
                }

        except ValidationError as e:
            # Extract user-friendly error message
            error_msg = self._format_validation_error(e)
            return {
                "success": False,
                "error": error_msg,
                "message": "Validation failed"
            }

    def view_tasks(self, status: TaskStatus | None = None) -> dict:
        """View tasks from the repository with optional status filter.

        Args:
            status: Optional status filter (PENDING or COMPLETED). If None, returns all tasks.

        Returns:
            Dictionary with:
                - success (bool): Always True
                - tasks (list[Task]): List of tasks (empty list if no tasks found)

        Examples:
            >>> service.view_tasks()
            {
                "success": True,
                "tasks": [Task(...), Task(...), ...]
            }

            >>> service.view_tasks(status=TaskStatus.PENDING)
            {
                "success": True,
                "tasks": [Task(...), ...]  # Only pending tasks
            }
        """
        # Get all tasks from repository
        all_tasks = self._repo.read_all()

        # Filter by status if provided
        if status is not None:
            filtered_tasks = [task for task in all_tasks if task.status == status]
        else:
            filtered_tasks = all_tasks

        # Sort by ID in ascending order
        sorted_tasks = sorted(filtered_tasks, key=lambda task: task.id)

        return {
            "success": True,
            "tasks": sorted_tasks
        }

    def mark_complete(self, task_id: int) -> dict:
        """Mark a task as complete.

        This is a convenience method that updates the task status to COMPLETED.

        Args:
            task_id: The ID of the task to mark as complete

        Returns:
            Dictionary with:
                - success (bool): True if task was marked complete, False if not found or invalid
                - task (Task): The updated task object (if successful)
                - message (str): Success or error message
                - error (str): Error details (if failed)

        Examples:
            >>> service.mark_complete(5)
            {
                "success": True,
                "task": Task(...),
                "message": "Task 'Buy groceries' (ID: 5) marked as complete"
            }

            >>> service.mark_complete(999)
            {
                "success": False,
                "error": "Task with ID 999 not found",
                "message": "Operation failed"
            }
        """
        # Validate task ID is positive
        if task_id <= 0:
            return {
                "success": False,
                "error": "Task ID must be a positive number",
                "message": "Invalid task ID"
            }

        # Check if task exists
        if not self._repo.exists(task_id):
            return {
                "success": False,
                "error": f"Task with ID {task_id} not found",
                "message": "Operation failed"
            }

        # Get current task to check status and get title for message
        current_task = self._repo.read(task_id)
        if not current_task:
            return {
                "success": False,
                "error": f"Failed to retrieve task with ID {task_id}",
                "message": "Operation failed"
            }

        # Check if already completed (for custom message)
        already_complete = current_task.status == TaskStatus.COMPLETED

        # Update task status to COMPLETED
        result = self.update_task(task_id, status=TaskStatus.COMPLETED)

        # Customize message based on whether it was already complete
        if result["success"]:
            if already_complete:
                result["message"] = f"Task '{current_task.title}' (ID: {task_id}) is already complete"
            else:
                result["message"] = f"Task '{current_task.title}' (ID: {task_id}) marked as complete"

        return result
