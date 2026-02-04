"""Task service for business logic."""

from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select

from src.models.task import Task, TaskStatus, TaskCreate, TaskUpdate


class TaskService:
    """Service layer for task operations."""

    def __init__(self, session: Session, user_id: Optional[str] = None):
        self.session = session
        self.user_id = user_id

    def create(self, task_data: TaskCreate) -> Task:
        """Create a new task."""
        task = Task(
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            due_date=task_data.due_date,
            reminder_time=task_data.reminder_time,  # Added for alarm functionality
            status=TaskStatus.PENDING,
            user_id=self.user_id,
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_all(self, status: Optional[TaskStatus] = None) -> List[Task]:
        """Get all tasks for current user, optionally filtered by status."""
        statement = select(Task)
        if self.user_id is not None:
            statement = statement.where(Task.user_id == self.user_id)
        if status:
            statement = statement.where(Task.status == status)
        statement = statement.order_by(Task.id)
        return list(self.session.exec(statement).all())

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Get a task by ID (only if owned by current user)."""
        task = self.session.get(Task, task_id)
        if task and self.user_id is not None and task.user_id != self.user_id:
            return None
        return task

    def update(self, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """Update a task."""
        task = self.get_by_id(task_id)
        if not task:
            return None

        update_data = task_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        task.updated_at = datetime.now()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def delete(self, task_id: int) -> bool:
        """Delete a task."""
        task = self.get_by_id(task_id)
        if not task:
            return False

        self.session.delete(task)
        self.session.commit()
        return True

    def mark_complete(self, task_id: int) -> Optional[Task]:
        """Mark a task as complete."""
        task = self.get_by_id(task_id)
        if not task:
            return None

        task.status = TaskStatus.COMPLETED
        task.updated_at = datetime.now()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task
