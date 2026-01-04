"""Task model with SQLModel."""

from datetime import datetime, date
from enum import Enum
from typing import Optional

from pydantic import field_validator, ConfigDict
from sqlmodel import Field, SQLModel


class TaskStatus(str, Enum):
    """Task status values."""
    PENDING = "pending"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(SQLModel):
    """Base task model for shared fields."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    due_date: Optional[date] = Field(default=None)


class Task(TaskBase, table=True):
    """Task database model."""

    model_config = ConfigDict(validate_assignment=True)

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True)  # Better Auth uses string UUIDs
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is between 1 and 200 characters."""
        if v is None or (isinstance(v, str) and len(v) < 1):
            raise ValueError("Title is required and must be at least 1 character")
        if isinstance(v, str) and len(v) > 200:
            raise ValueError("Title must not exceed 200 characters")
        return v

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate description does not exceed 1000 characters."""
        if v is not None and isinstance(v, str) and len(v) > 1000:
            raise ValueError("Description must not exceed 1000 characters")
        return v


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    pass


class TaskUpdate(SQLModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
