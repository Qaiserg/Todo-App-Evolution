"""Data models for the todo application."""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class TaskStatus(str, Enum):
    """Enum for task status values."""

    PENDING = "pending"
    COMPLETED = "completed"


class Task(BaseModel):
    """Task model with Pydantic validation.

    Attributes:
        id: Unique identifier for the task (auto-generated)
        title: Brief description of what needs to be done (1-200 characters)
        description: Optional additional details (max 1000 characters)
        status: Current state of the task (PENDING or COMPLETED)
        created_at: Timestamp when the task was created
        updated_at: Timestamp when the task was last modified
    """

    model_config = ConfigDict(use_enum_values=True)

    id: int
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime
    updated_at: datetime
