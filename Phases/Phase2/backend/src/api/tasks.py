"""Task API endpoints with user_id in URL."""

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session

from src.database import get_session
from src.auth import verify_user_token, security
from src.models.task import Task, TaskStatus, TaskCreate, TaskUpdate
from src.services.task_service import TaskService

router = APIRouter(prefix="/api/{user_id}", tags=["tasks"])


def get_task_service(
    user_id: str,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TaskService:
    """Dependency to get task service with verified user."""
    # Verify the token and user_id match
    verify_user_token(user_id, credentials)
    return TaskService(session, user_id=user_id)


@router.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Task:
    """Create a new task."""
    verify_user_token(user_id, credentials)
    service = TaskService(session, user_id=user_id)
    return service.create(task_data)


@router.get("/tasks", response_model=List[Task])
def list_tasks(
    user_id: str,
    status_filter: Optional[TaskStatus] = None,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> List[Task]:
    """List all tasks with optional status filter."""
    verify_user_token(user_id, credentials)
    service = TaskService(session, user_id=user_id)
    return service.get_all(status=status_filter)


@router.get("/tasks/{task_id}", response_model=Task)
def get_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Task:
    """Get a task by ID."""
    verify_user_token(user_id, credentials)
    service = TaskService(session, user_id=user_id)
    task = service.get_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task


@router.put("/tasks/{task_id}", response_model=Task)
def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Task:
    """Update a task."""
    verify_user_token(user_id, credentials)
    service = TaskService(session, user_id=user_id)
    task = service.update(task_id, task_data)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> None:
    """Delete a task."""
    verify_user_token(user_id, credentials)
    service = TaskService(session, user_id=user_id)
    if not service.delete(task_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )


@router.patch("/tasks/{task_id}/complete", response_model=Task)
def mark_task_complete(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Task:
    """Mark a task as complete."""
    verify_user_token(user_id, credentials)
    service = TaskService(session, user_id=user_id)
    task = service.mark_complete(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task
