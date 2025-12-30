"""Shared pytest fixtures for all tests."""

import pytest
from datetime import datetime
from src.models import Task, TaskStatus
from src.repository import TaskRepository
from src.service import TaskService


@pytest.fixture
def clean_repo():
    """Provide a clean task repository for each test."""
    return TaskRepository()


@pytest.fixture
def service(clean_repo):
    """Provide a TaskService with clean repository."""
    return TaskService(clean_repo)


@pytest.fixture
def sample_task():
    """Provide a standard test task."""
    return Task(
        id=1,
        title="Sample Task",
        description="Test description",
        status=TaskStatus.PENDING,
        created_at=datetime.now(),
        updated_at=datetime.now()
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
            id=clean_repo._next_id,
            title=task_data["title"],
            description=task_data["description"],
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        clean_repo.create(task)

    return clean_repo
