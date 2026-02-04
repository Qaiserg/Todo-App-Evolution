# MCP Tools API Documentation

## Overview
MCP (Model Context Protocol) tools allow the AI agent to interact with the todo system. Each tool is a function the agent can call to perform task management operations.

## Tool: add_task

Creates a new task for the authenticated user.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Task title (1-200 chars) |
| description | string | No | Task description |
| priority | string | No | "low", "medium", or "high" (default: "medium") |
| due_date | string | No | ISO date format (YYYY-MM-DD) |

### Returns
```json
{
  "success": true,
  "task": {
    "id": 123,
    "title": "Buy groceries",
    "description": null,
    "priority": "medium",
    "status": "pending",
    "due_date": "2024-01-20",
    "created_at": "2024-01-19T10:30:00Z"
  }
}
```

### Errors
- `ValidationError`: Invalid input parameters
- `AuthError`: User not authenticated

---

## Tool: list_tasks

Lists tasks for the authenticated user with optional filters.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | "pending" or "completed" |
| priority | string | No | "low", "medium", or "high" |
| due_today | boolean | No | Filter tasks due today |

### Returns
```json
{
  "success": true,
  "tasks": [
    {
      "id": 123,
      "title": "Buy groceries",
      "priority": "medium",
      "status": "pending",
      "due_date": "2024-01-20"
    },
    {
      "id": 124,
      "title": "Call dentist",
      "priority": "high",
      "status": "pending",
      "due_date": "2024-01-19"
    }
  ],
  "count": 2
}
```

---

## Tool: complete_task

Marks a task as completed.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | ID of task to complete |

### Returns
```json
{
  "success": true,
  "task": {
    "id": 123,
    "title": "Buy groceries",
    "status": "completed",
    "completed_at": "2024-01-19T14:30:00Z"
  }
}
```

### Errors
- `NotFoundError`: Task not found or doesn't belong to user
- `AlreadyCompletedError`: Task is already completed

---

## Tool: delete_task

Deletes a task permanently.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | ID of task to delete |

### Returns
```json
{
  "success": true,
  "message": "Task 'Buy groceries' has been deleted"
}
```

### Errors
- `NotFoundError`: Task not found or doesn't belong to user

---

## Tool: update_task

Updates task details. Only provided fields are updated.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | ID of task to update |
| title | string | No | New task title |
| description | string | No | New description |
| priority | string | No | New priority |
| due_date | string | No | New due date (YYYY-MM-DD) |

### Returns
```json
{
  "success": true,
  "task": {
    "id": 123,
    "title": "Buy groceries and supplies",
    "priority": "high",
    "status": "pending",
    "due_date": "2024-01-21"
  },
  "changes": ["title", "priority", "due_date"]
}
```

### Errors
- `NotFoundError`: Task not found or doesn't belong to user
- `ValidationError`: Invalid input parameters

---

## Authentication Context

All MCP tools automatically receive the authenticated user context. The agent cannot access tasks belonging to other users.

```python
# Internal implementation pattern
def add_task(ctx: ToolContext, title: str, ...) -> dict:
    user_id = ctx.user_id  # Injected from JWT
    # Create task for this user only
    ...
```

## Error Response Format

All tools return errors in this format:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task with ID 123 not found"
  }
}
```

## Tool Registration

Tools are registered with the MCP server at startup:

```python
from mcp import Server, Tool

server = Server()

server.register_tool(
    Tool(
        name="add_task",
        description="Create a new task for the user",
        parameters={...},
        handler=add_task_handler
    )
)
```
