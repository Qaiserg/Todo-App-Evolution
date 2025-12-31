"""Repository layer for task storage (SQLModel database implementation)."""

from datetime import datetime

from sqlmodel import Session, select

from src.models import Task


class TaskRepository:
    """SQLModel task repository using SQLite database.

    This implementation uses SQLModel for ORM operations with SQLite.
    The interface remains the same as Phase 1 for backward compatibility.

    Attributes:
        _session: SQLModel database session
    """

    def __init__(self, session: Session) -> None:
        """Initialize repository with a database session.

        Args:
            session: SQLModel database session
        """
        self._session = session

    def create(self, task: Task) -> Task:
        """Create a new task in the database.

        Args:
            task: Task object to store (ID will be auto-assigned by database)

        Returns:
            The created task with assigned ID
        """
        self._session.add(task)
        self._session.commit()
        self._session.refresh(task)
        return task

    def read(self, task_id: int) -> Task | None:
        """Read a task by ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            Task object if found, None otherwise
        """
        return self._session.get(Task, task_id)

    def read_all(self) -> list[Task]:
        """Read all tasks from the database.

        Returns:
            List of all Task objects (empty list if none exist)
        """
        statement = select(Task)
        results = self._session.exec(statement)
        return list(results.all())

    def update(self, task_id: int, updates: dict) -> Task | None:
        """Update a task's fields.

        Args:
            task_id: The ID of the task to update
            updates: Dictionary of field names and new values

        Returns:
            Updated Task object if found, None otherwise
        """
        task = self._session.get(Task, task_id)
        if task is None:
            return None

        for key, value in updates.items():
            if hasattr(task, key):
                setattr(task, key, value)

        # Always update the updated_at timestamp
        task.updated_at = datetime.now()

        self._session.add(task)
        self._session.commit()
        self._session.refresh(task)
        return task

    def delete(self, task_id: int) -> bool:
        """Delete a task from the database.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if task was deleted, False if task didn't exist
        """
        task = self._session.get(Task, task_id)
        if task is None:
            return False

        self._session.delete(task)
        self._session.commit()
        return True

    def exists(self, task_id: int) -> bool:
        """Check if a task exists in the database.

        Args:
            task_id: The ID of the task to check

        Returns:
            True if task exists, False otherwise
        """
        task = self._session.get(Task, task_id)
        return task is not None
