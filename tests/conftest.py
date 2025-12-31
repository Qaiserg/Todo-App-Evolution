"""Shared pytest fixtures for all tests."""

import pytest
from datetime import datetime

from sqlmodel import Session, SQLModel, create_engine

from src.models import Task, TaskStatus
from src.repository import TaskRepository
from src.service import TaskService


# Use in-memory SQLite for tests (fast and isolated)
# Production uses Neon PostgreSQL
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture
def session():
    """Provide a clean database session for each test."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture
def clean_repo(session):
    """Provide a clean task repository for each test."""
    return TaskRepository(session)


@pytest.fixture
def service(clean_repo):
    """Provide a TaskService with clean repository."""
    return TaskService(clean_repo)


@pytest.fixture
def sample_task():
    """Provide a standard test task."""
    return Task(
        title="Sample Task",
        description="Test description",
        status=TaskStatus.PENDING
    )


@pytest.fixture
def populated_repo(clean_repo):
    """Provide a repository with 3 tasks."""
    tasks_data = [
        {"title": "Task 1", "description": "First task"},
        {"title": "Task 2", "description": "Second task"},
        {"title": "Task 3", "description": None},
    ]

    for task_data in tasks_data:
        task = Task(
            title=task_data["title"],
            description=task_data["description"],
            status=TaskStatus.PENDING
        )
        clean_repo.create(task)

    return clean_repo
