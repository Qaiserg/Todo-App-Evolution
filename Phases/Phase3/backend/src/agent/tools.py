"""MCP Tools for the AI Agent to manage tasks."""

from datetime import date, datetime
from typing import Optional, Literal

from sqlmodel import Session

from src.models.task import TaskCreate, TaskUpdate, TaskStatus, TaskPriority
from src.services.task_service import TaskService


def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Parse date string in YYYY-MM-DD format."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def task_to_dict(task) -> dict:
    """Convert task to dictionary for agent response."""
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority.value if task.priority else "medium",
        "status": task.status.value if task.status else "pending",
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "reminder_time": task.reminder_time.isoformat() if task.reminder_time else None,
        "is_reminded": getattr(task, 'is_reminded', False),
        "created_at": task.created_at.isoformat() if task.created_at else None,
    }


def parse_datetime(datetime_str: Optional[str]) -> Optional[datetime]:
    """Parse datetime string in ISO format."""
    if not datetime_str:
        return None
    try:
        return datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return None


def add_task(
    session: Session,
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Literal["low", "medium", "high"] = "medium",
    due_date: Optional[str] = None,
    reminder_time: Optional[str] = None,
) -> dict:
    """
    Create a new task for the user.

    Args:
        title: The task title (required)
        description: Optional task description
        priority: Task priority - "low", "medium", or "high" (default: "medium")
        due_date: Due date in YYYY-MM-DD format (optional)
        reminder_time: Reminder time in ISO format (e.g., "2026-01-25T17:00:00") (optional)

    Returns:
        Dictionary with success status and created task details
    """
    service = TaskService(session, user_id=user_id)

    task_data = TaskCreate(
        title=title,
        description=description,
        priority=TaskPriority(priority),
        due_date=parse_date(due_date),
        reminder_time=parse_datetime(reminder_time),
    )

    task = service.create(task_data)

    return {
        "success": True,
        "task": task_to_dict(task),
        "message": f"Created task '{task.title}'" + (f" with reminder at {reminder_time}" if reminder_time else "")
    }


def list_tasks(
    session: Session,
    user_id: str,
    status: Optional[Literal["pending", "completed"]] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    due_today: bool = False,
    due_overdue: bool = False,
) -> dict:
    """
    List the user's tasks with optional filters.

    Args:
        status: Filter by status - "pending" or "completed" (optional)
        priority: Filter by priority - "low", "medium", or "high" (optional)
        due_today: If True, only show tasks due today (default: False)
        due_overdue: If True, only show overdue tasks (tasks with due_date < today and status pending) (default: False)

    Returns:
        Dictionary with success status and list of tasks including due_date for each task
    """
    service = TaskService(session, user_id=user_id)

    # Get tasks filtered by status
    task_status = TaskStatus(status) if status else None
    tasks = service.get_all(status=task_status)

    # Apply additional filters
    if priority:
        tasks = [t for t in tasks if t.priority == TaskPriority(priority)]

    today = date.today()

    if due_today:
        tasks = [t for t in tasks if t.due_date == today]

    if due_overdue:
        tasks = [t for t in tasks if t.due_date and t.due_date < today and t.status == TaskStatus.PENDING]

    return {
        "success": True,
        "tasks": [task_to_dict(t) for t in tasks],
        "count": len(tasks)
    }


def complete_task(
    session: Session,
    user_id: str,
    task_id: int,
) -> dict:
    """
    Mark a task as completed.

    Args:
        task_id: The ID of the task to complete

    Returns:
        Dictionary with success status and updated task details
    """
    service = TaskService(session, user_id=user_id)

    task = service.mark_complete(task_id)

    if not task:
        return {
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": f"Task with ID {task_id} not found"
            }
        }

    return {
        "success": True,
        "task": task_to_dict(task),
        "message": f"Marked '{task.title}' as complete"
    }


def delete_task(
    session: Session,
    user_id: str,
    task_id: int,
) -> dict:
    """
    Delete a task.

    Args:
        task_id: The ID of the task to delete

    Returns:
        Dictionary with success status and confirmation message
    """
    service = TaskService(session, user_id=user_id)

    # Get task title before deleting
    task = service.get_by_id(task_id)
    if not task:
        return {
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": f"Task with ID {task_id} not found"
            }
        }

    title = task.title
    deleted = service.delete(task_id)

    if not deleted:
        return {
            "success": False,
            "error": {
                "code": "DELETE_FAILED",
                "message": f"Failed to delete task with ID {task_id}"
            }
        }

    return {
        "success": True,
        "message": f"Deleted task '{title}'"
    }


def update_task(
    session: Session,
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    due_date: Optional[str] = None,
    reminder_time: Optional[str] = None,
    status: Optional[Literal["pending", "completed"]] = None,
) -> dict:
    """
    Update task details. Only provided fields are updated.

    Args:
        task_id: The ID of the task to update
        title: New task title (optional)
        description: New task description (optional)
        priority: New priority - "low", "medium", or "high" (optional)
        due_date: New due date in YYYY-MM-DD format (optional)
        reminder_time: New reminder time in ISO format (optional)
        status: New status - "pending" or "completed" (optional)

    Returns:
        Dictionary with success status and updated task details
    """
    service = TaskService(session, user_id=user_id)

    # Build update data only with provided fields
    update_data = {}
    changes = []

    if title is not None:
        update_data["title"] = title
        changes.append("title")
    if description is not None:
        update_data["description"] = description
        changes.append("description")
    if priority is not None:
        update_data["priority"] = TaskPriority(priority)
        changes.append("priority")
    if due_date is not None:
        update_data["due_date"] = parse_date(due_date)
        changes.append("due_date")
    if reminder_time is not None:
        update_data["reminder_time"] = parse_datetime(reminder_time)
        changes.append("reminder_time")
    if status is not None:
        update_data["status"] = TaskStatus(status)
        changes.append("status")

    if not update_data:
        return {
            "success": False,
            "error": {
                "code": "NO_CHANGES",
                "message": "No fields to update were provided"
            }
        }

    task_update = TaskUpdate(**update_data)
    task = service.update(task_id, task_update)

    if not task:
        return {
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": f"Task with ID {task_id} not found"
            }
        }

    return {
        "success": True,
        "task": task_to_dict(task),
        "changes": changes,
        "message": f"Updated '{task.title}'"
    }


# Tool definitions for OpenAI function calling
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user. Can optionally set a reminder alarm.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The task title (required, 1-200 characters)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Task priority (default: medium)"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Due date in YYYY-MM-DD format"
                    },
                    "reminder_time": {
                        "type": "string",
                        "description": "When to trigger reminder alarm in ISO datetime format (e.g., '2026-01-25T17:00:00'). Use this when user says 'remind me at 5 PM' or 'set an alarm for 3 PM'"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List the user's tasks with optional filters. Returns due_date for each task so you can identify overdue tasks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "Filter by task status"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Filter by task priority"
                    },
                    "due_today": {
                        "type": "boolean",
                        "description": "If true, only show tasks due today"
                    },
                    "due_overdue": {
                        "type": "boolean",
                        "description": "If true, only show overdue tasks (tasks past their due date)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to complete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update task details including reminder time. Only provided fields are updated.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "New task priority"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in YYYY-MM-DD format"
                    },
                    "reminder_time": {
                        "type": "string",
                        "description": "New reminder time in ISO format (e.g., '2026-01-25T17:00:00')"
                    }
                },
                "required": ["task_id"]
            }
        }
    }
]


def get_agent_tools():
    """Get tool definitions for the OpenAI agent."""
    return TOOL_DEFINITIONS


def execute_tool(
    tool_name: str,
    arguments: dict,
    session: Session,
    user_id: str
) -> dict:
    """Execute a tool by name with given arguments."""
    tool_map = {
        "add_task": add_task,
        "list_tasks": list_tasks,
        "complete_task": complete_task,
        "delete_task": delete_task,
        "update_task": update_task,
    }

    if tool_name not in tool_map:
        return {
            "success": False,
            "error": {
                "code": "UNKNOWN_TOOL",
                "message": f"Unknown tool: {tool_name}"
            }
        }

    tool_fn = tool_map[tool_name]
    return tool_fn(session=session, user_id=user_id, **arguments)
