"""Repository layer for task storage (in-memory implementation)."""

from datetime import datetime
from src.models import Task


class TaskRepository:
    """In-memory task repository using dictionary storage.

    This implementation uses a simple dict to store tasks in memory.
    In Phase 2, this will be replaced with SQLModel + database,
    but the interface will remain the same.

    Attributes:
        _tasks: Dictionary mapping task IDs to Task objects
        _next_id: Counter for auto-incrementing task IDs
    """

    def __init__(self) -> None:
        """Initialize an empty task repository."""
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def create(self, task: Task) -> Task:
        """Create a new task in the repository.

        Args:
            task: Task object to store (ID will be auto-assigned)

        Returns:
            The created task with assigned ID
        """
        task.id = self._next_id
        self._tasks[self._next_id] = task
        self._next_id += 1
        return task

    def read(self, task_id: int) -> Task | None:
        """Read a task by ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            Task object if found, None otherwise
        """
        return self._tasks.get(task_id)

    def read_all(self) -> list[Task]:
        """Read all tasks from the repository.

        Returns:
            List of all Task objects (empty list if none exist)
        """
        return list(self._tasks.values())

    def update(self, task_id: int, updates: dict) -> Task | None:
        """Update a task's fields.

        Args:
            task_id: The ID of the task to update
            updates: Dictionary of field names and new values

        Returns:
            Updated Task object if found, None otherwise
        """
        if task_id not in self._tasks:
            return None

        task = self._tasks[task_id]
        for key, value in updates.items():
            if hasattr(task, key):
                setattr(task, key, value)

        # Always update the updated_at timestamp
        task.updated_at = datetime.now()
        return task

    def delete(self, task_id: int) -> bool:
        """Delete a task from the repository.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if task was deleted, False if task didn't exist
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def exists(self, task_id: int) -> bool:
        """Check if a task exists in the repository.

        Args:
            task_id: The ID of the task to check

        Returns:
            True if task exists, False otherwise
        """
        return task_id in self._tasks
