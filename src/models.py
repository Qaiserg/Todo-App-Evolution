"""Data models for the todo application.

Uses SQLModel for combined Pydantic validation and SQLAlchemy ORM mapping.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import field_validator, ConfigDict
from sqlmodel import Field, SQLModel


class TaskStatus(str, Enum):
    """Enum for task status values."""

    PENDING = "pending"
    COMPLETED = "completed"


class Task(SQLModel, table=True):
    """Task model with SQLModel validation and database mapping.

    Attributes:
        id: Unique identifier for the task (auto-generated primary key)
        title: Brief description of what needs to be done (1-200 characters)
        description: Optional additional details (max 1000 characters)
        status: Current state of the task (PENDING or COMPLETED)
        created_at: Timestamp when the task was created
        updated_at: Timestamp when the task was last modified
    """

    model_config = ConfigDict(validate_assignment=True)

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(...)
    description: Optional[str] = Field(default=None)
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
