"""MCP Server exposing todo task operations as tools."""

from datetime import date, datetime
from typing import Optional

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from pydantic import BaseModel

from sqlmodel import Session, create_engine, select
from src.config import DATABASE_URL
from src.models.task import Task, TaskStatus, TaskPriority

# Create database engine
engine = create_engine(DATABASE_URL)

# Create MCP server
mcp = Server("todo-mcp-server")


class AddTaskParams(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None


class ListTasksParams(BaseModel):
    user_id: str
    status: Optional[str] = "all"  # "all", "pending", "completed"


class CompleteTaskParams(BaseModel):
    user_id: str
    task_id: int


class DeleteTaskParams(BaseModel):
    user_id: str
    task_id: int


class UpdateTaskParams(BaseModel):
    user_id: str
    task_id: int
    title: Optional[str] = None
    description: Optional[str] = None


@mcp.list_tools()
async def list_tools():
    """List available MCP tools."""
    return [
        Tool(
            name="add_task",
            description="Create a new task for the user",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "The user ID"},
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description (optional)"},
                },
                "required": ["user_id", "title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List user's tasks with optional status filter",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "The user ID"},
                    "status": {"type": "string", "enum": ["all", "pending", "completed"], "description": "Filter by status"},
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "The user ID"},
                    "task_id": {"type": "integer", "description": "Task ID to complete"},
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "The user ID"},
                    "task_id": {"type": "integer", "description": "Task ID to delete"},
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update a task's title or description",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "The user ID"},
                    "task_id": {"type": "integer", "description": "Task ID to update"},
                    "title": {"type": "string", "description": "New title (optional)"},
                    "description": {"type": "string", "description": "New description (optional)"},
                },
                "required": ["user_id", "task_id"]
            }
        ),
    ]


@mcp.call_tool()
async def call_tool(name: str, arguments: dict):
    """Handle tool calls."""
    with Session(engine) as session:
        if name == "add_task":
            return await add_task(session, arguments)
        elif name == "list_tasks":
            return await list_tasks_tool(session, arguments)
        elif name == "complete_task":
            return await complete_task(session, arguments)
        elif name == "delete_task":
            return await delete_task(session, arguments)
        elif name == "update_task":
            return await update_task(session, arguments)
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]


async def add_task(session: Session, args: dict):
    """Create a new task."""
    task = Task(
        title=args["title"],
        description=args.get("description"),
        priority=TaskPriority.MEDIUM,
        status=TaskStatus.PENDING,
        user_id=args["user_id"],
        due_date=date.today(),
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    return [TextContent(
        type="text",
        text=f'{{"task_id": {task.id}, "status": "created", "title": "{task.title}"}}'
    )]


async def list_tasks_tool(session: Session, args: dict):
    """List tasks with optional filter."""
    user_id = args["user_id"]
    status_filter = args.get("status", "all")

    statement = select(Task).where(Task.user_id == user_id)

    if status_filter == "pending":
        statement = statement.where(Task.status == TaskStatus.PENDING)
    elif status_filter == "completed":
        statement = statement.where(Task.status == TaskStatus.COMPLETED)

    tasks = list(session.exec(statement).all())

    task_list = [
        {"id": t.id, "title": t.title, "completed": t.status == TaskStatus.COMPLETED}
        for t in tasks
    ]

    import json
    return [TextContent(type="text", text=json.dumps(task_list))]


async def complete_task(session: Session, args: dict):
    """Mark a task as completed."""
    task = session.get(Task, args["task_id"])

    if not task or task.user_id != args["user_id"]:
        return [TextContent(type="text", text='{"error": "Task not found"}')]

    task.status = TaskStatus.COMPLETED
    task.updated_at = datetime.now()
    session.add(task)
    session.commit()

    return [TextContent(
        type="text",
        text=f'{{"task_id": {task.id}, "status": "completed", "title": "{task.title}"}}'
    )]


async def delete_task(session: Session, args: dict):
    """Delete a task."""
    task = session.get(Task, args["task_id"])

    if not task or task.user_id != args["user_id"]:
        return [TextContent(type="text", text='{"error": "Task not found"}')]

    title = task.title
    task_id = task.id
    session.delete(task)
    session.commit()

    return [TextContent(
        type="text",
        text=f'{{"task_id": {task_id}, "status": "deleted", "title": "{title}"}}'
    )]


async def update_task(session: Session, args: dict):
    """Update a task."""
    task = session.get(Task, args["task_id"])

    if not task or task.user_id != args["user_id"]:
        return [TextContent(type="text", text='{"error": "Task not found"}')]

    if args.get("title"):
        task.title = args["title"]
    if args.get("description"):
        task.description = args["description"]

    task.updated_at = datetime.now()
    session.add(task)
    session.commit()

    return [TextContent(
        type="text",
        text=f'{{"task_id": {task.id}, "status": "updated", "title": "{task.title}"}}'
    )]


async def run_mcp_server():
    """Run the MCP server via stdio."""
    async with stdio_server() as (read_stream, write_stream):
        await mcp.run(read_stream, write_stream, mcp.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(run_mcp_server())
