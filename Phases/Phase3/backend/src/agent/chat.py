"""Chat processing using OpenAI Agents SDK with MCP tools."""

import json
import os
from datetime import date, datetime, timedelta
from typing import Optional, List

from agents import Agent, Runner, function_tool
from sqlmodel import Session

from src.agent.tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)

# Model to use
OPENAI_MODEL = "gpt-4o-mini"


def get_system_prompt(language: str = "en") -> str:
    """Get system prompt with current date and language support."""
    today = date.today()
    now = datetime.now()
    tomorrow = (today + timedelta(days=1)).isoformat()
    next_week = (today + timedelta(days=7)).isoformat()

    # Calculate example future times for relative reminders
    in_1_min = (now + timedelta(minutes=1)).isoformat()
    in_2_hours = (now + timedelta(hours=2)).isoformat()

    # Language-specific instructions
    language_instruction = ""
    if language == "ur":
        language_instruction = "\n\nIMPORTANT: Respond to the user in Urdu (اردو). Use natural, conversational Urdu language in all your responses."

    return f"""You are a helpful todo assistant. You help users manage their tasks through natural conversation.{language_instruction}

CURRENT DATE & TIME INFO:
- Today: {today.strftime('%A, %B %d, %Y')} ({today.isoformat()})
- Current time: {now.strftime('%I:%M %p')} ({now.isoformat()})
- Tomorrow: {(today + timedelta(days=1)).strftime('%A, %B %d, %Y')} ({tomorrow})
- Next week: {(today + timedelta(days=7)).strftime('%A, %B %d, %Y')} ({next_week})

You have access to the following tools to manage tasks:
- add_task: Create new tasks with title, description, priority, due_date, and reminder_time (for alarms)
- list_tasks: List user's tasks (filter by: all, pending, completed)
- complete_task: Mark a task as completed
- delete_task: Delete a task
- update_task: Update a task's title, description, priority, due_date, reminder_time, or status

⚠️ CRITICAL REMINDER/ALARM RULE:
Whenever the user says "remind me", "set alarm", "notify me", or "alert me", you MUST:
1. Calculate the exact time (absolute or relative to current time {now.isoformat()})
2. Pass it to the reminder_time parameter in ISO format (YYYY-MM-DDTHH:MM:SS)
3. WITHOUT the reminder_time parameter, NO alarm will ring!

CRITICAL TASK IDENTIFICATION RULES:
1. ALWAYS call list_tasks() FIRST before completing, deleting, or updating a task by name
2. Match task names fuzzy - "call john" matches "Call John" or "call john"
3. If multiple matches, ask user which one
4. To reopen a completed task: use update_task with status="pending"

CRITICAL DATE & PRIORITY PARSING RULES:
1. ALWAYS set due_date when user mentions timing:
   - "today" → {today.isoformat()}
   - "tomorrow" → {tomorrow}
   - "next week" → {next_week}
   - "in 3 days" → calculate and use YYYY-MM-DD format
   - If no date mentioned, leave due_date as null

2. ALWAYS set priority based on context:
   - "urgent", "important", "asap", "critical" → priority="high"
   - "low priority", "when you can", "someday" → priority="low"
   - Default → priority="medium"

3. REMINDER/ALARM PARSING - CRITICAL FOR ALARM FUNCTIONALITY:
   When user says "remind me", "set alarm", "notify me", you MUST set the reminder_time parameter:

   ABSOLUTE TIMES:
   - "remind me at 5 PM" → reminder_time="{today.isoformat()}T17:00:00"
   - "remind me at 2:30 PM" → reminder_time="{today.isoformat()}T14:30:00"
   - "set alarm for 3:30 PM tomorrow" → reminder_time="{tomorrow}T15:30:00"
   - "remind me at 9 AM on Monday" → calculate next Monday at 9 AM

   RELATIVE TIMES (ADD to current time {now.isoformat()}):
   - "remind me in 1 minute" → ADD 1 minute to current time
   - "remind me in 5 minutes" → ADD 5 minutes to current time
   - "notify me in 2 hours" → ADD 2 hours to current time
   - "remind me in 30 seconds" → ADD 30 seconds to current time

   FORMAT: Always use ISO 8601: YYYY-MM-DDTHH:MM:SS (e.g., "2026-01-31T14:30:00")

   IMPORTANT: You MUST calculate the exact time and pass it to reminder_time parameter!
   If user says "remind me" without specific time, ask for clarification.

4. NEVER ask for clarification on dates or priorities - infer from context
5. Always call tools immediately - don't ask unnecessary questions
6. Be concise - confirm actions briefly after completing them
7. When listing tasks, format them nicely with due dates, priorities, and reminder times

EXAMPLES:
Creating tasks:
- "add task to buy groceries tomorrow" → add_task(title="Buy groceries", due_date="{tomorrow}", priority="medium")
- "create urgent task to finish report today" → add_task(title="Finish report", due_date="{today.isoformat()}", priority="high")
- "remind me to call mom at 5 PM" → add_task(title="Call mom", reminder_time="{today.isoformat()}T17:00:00", priority="medium")
- "remind me in 1 minute" → add_task(title="Reminder", reminder_time="{in_1_min}", priority="medium")
- "notify me in 2 hours to check email" → add_task(title="Check email", reminder_time="{in_2_hours}", priority="medium")
- "set alarm for gym at 6 AM tomorrow" → add_task(title="Gym", due_date="{tomorrow}", reminder_time="{tomorrow}T06:00:00", priority="medium")

Acting on existing tasks:
- "mark call john as complete" → FIRST list_tasks(), THEN complete_task(task_id=<found_id>)
- "delete buy groceries task" → FIRST list_tasks(), THEN delete_task(task_id=<found_id>)
- "mark task 57 as incomplete" → update_task(task_id=57, status="pending")
- "change reminder time to 3 PM for task 42" → update_task(task_id=42, reminder_time="{today.isoformat()}T15:00:00")

Remember: ALWAYS list tasks first when user refers to task by name. Act immediately, parse dates and priorities intelligently, don't ask questions unless truly necessary."""


# Create function tools using the @function_tool decorator
@function_tool
def mcp_add_task(
    user_id: str,
    title: str,
    description: str = "",
    priority: str = "medium",
    due_date: str = "",
    reminder_time: str = ""
) -> str:
    """
    Create a new task for the user.

    Args:
        user_id: The user's ID
        title: The task title
        description: Optional task description
        priority: Task priority (low, medium, high)
        due_date: Due date in YYYY-MM-DD format
        reminder_time: Reminder time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
    """
    # Import here to avoid circular imports
    from src.database import get_engine
    from sqlmodel import Session

    engine = get_engine()
    with Session(engine) as session:
        result = add_task(
            session,
            user_id,
            title,
            description=description if description else None,
            priority=priority,
            due_date=due_date if due_date else None,
            reminder_time=reminder_time if reminder_time else None
        )
        return json.dumps(result)


@function_tool
def mcp_list_tasks(user_id: str, status: str = "all") -> str:
    """
    List the user's tasks.

    Args:
        user_id: The user's ID
        status: Filter by status - "all", "pending", or "completed"
    """
    from src.database import get_engine
    from sqlmodel import Session

    engine = get_engine()
    with Session(engine) as session:
        result = list_tasks(session, user_id, status=status)
        return json.dumps(result)


@function_tool
def mcp_complete_task(user_id: str, task_id: int) -> str:
    """
    Mark a task as completed.

    Args:
        user_id: The user's ID
        task_id: The ID of the task to complete
    """
    from src.database import get_engine
    from sqlmodel import Session

    engine = get_engine()
    with Session(engine) as session:
        result = complete_task(session, user_id, task_id)
        return json.dumps(result)


@function_tool
def mcp_delete_task(user_id: str, task_id: int) -> str:
    """
    Delete a task.

    Args:
        user_id: The user's ID
        task_id: The ID of the task to delete
    """
    from src.database import get_engine
    from sqlmodel import Session

    engine = get_engine()
    with Session(engine) as session:
        result = delete_task(session, user_id, task_id)
        return json.dumps(result)


@function_tool
def mcp_update_task(
    user_id: str,
    task_id: int,
    title: str = "",
    description: str = "",
    priority: str = "",
    due_date: str = "",
    reminder_time: str = "",
    status: str = ""
) -> str:
    """
    Update a task's properties.

    Args:
        user_id: The user's ID
        task_id: The ID of the task to update
        title: New title (optional)
        description: New description (optional)
        priority: New priority - low, medium, high (optional)
        due_date: New due date in YYYY-MM-DD format (optional)
        reminder_time: New reminder time in ISO 8601 format (optional)
        status: New status - pending or completed (optional)
    """
    from src.database import get_engine
    from sqlmodel import Session

    engine = get_engine()
    with Session(engine) as session:
        result = update_task(
            session, user_id, task_id,
            title=title if title else None,
            description=description if description else None,
            priority=priority if priority else None,
            due_date=due_date if due_date else None,
            reminder_time=reminder_time if reminder_time else None,
            status=status if status else None
        )
        return json.dumps(result)


def create_agent(user_id: str, language: str = "en") -> Agent:
    """Create an agent with MCP tools bound to a specific user with language support."""

    # Create wrapped tools that inject user_id
    @function_tool
    def add_task_tool(
        title: str,
        description: str = "",
        priority: str = "medium",
        due_date: str = None,
        reminder_time: str = None
    ) -> str:
        """
        Create a new task with optional reminder alarm.

        Args:
            title: The task title (required)
            description: Optional task description
            priority: Task priority - "low", "medium", or "high" (default: "medium")
            due_date: Due date in YYYY-MM-DD format (e.g., "2026-01-20")
            reminder_time: Reminder alarm time in ISO format (e.g., "2026-01-25T17:00:00"). Use this when user says "remind me at 5 PM" or "set an alarm for 3 PM"
        """
        from src.database import get_engine
        from sqlmodel import Session
        engine = get_engine()
        with Session(engine) as session:
            result = add_task(
                session,
                user_id,
                title,
                description=description,
                priority=priority,
                due_date=due_date,
                reminder_time=reminder_time
            )
            return json.dumps(result)

    @function_tool
    def list_tasks_tool(status: str = "all") -> str:
        """List tasks. Args: status ('all', 'pending', or 'completed')"""
        from src.database import get_engine
        from sqlmodel import Session
        engine = get_engine()
        with Session(engine) as session:
            result = list_tasks(session, user_id, status=status)
            return json.dumps(result)

    @function_tool
    def complete_task_tool(task_id: int) -> str:
        """Mark a task as completed. Args: task_id (required)"""
        from src.database import get_engine
        from sqlmodel import Session
        engine = get_engine()
        with Session(engine) as session:
            result = complete_task(session, user_id, task_id)
            return json.dumps(result)

    @function_tool
    def delete_task_tool(task_id: int) -> str:
        """Delete a task. Args: task_id (required)"""
        from src.database import get_engine
        from sqlmodel import Session
        engine = get_engine()
        with Session(engine) as session:
            result = delete_task(session, user_id, task_id)
            return json.dumps(result)

    @function_tool
    def update_task_tool(
        task_id: int,
        title: str = "",
        description: str = "",
        priority: str = "",
        due_date: str = "",
        reminder_time: str = "",
        status: str = ""
    ) -> str:
        """
        Update a task's details including reminder time and status.

        Args:
            task_id: The ID of the task to update (required)
            title: New task title (optional)
            description: New task description (optional)
            priority: New priority - "low", "medium", or "high" (optional)
            due_date: New due date in YYYY-MM-DD format (optional)
            reminder_time: New reminder time in ISO format (e.g., "2026-01-25T17:00:00") (optional)
            status: New status - "pending" or "completed" (optional, use "pending" to reopen completed tasks)
        """
        from src.database import get_engine
        from sqlmodel import Session
        engine = get_engine()
        with Session(engine) as session:
            result = update_task(
                session, user_id, task_id,
                title=title if title else None,
                description=description if description else None,
                priority=priority if priority else None,
                due_date=due_date if due_date else None,
                reminder_time=reminder_time if reminder_time else None,
                status=status if status else None
            )
            return json.dumps(result)

    return Agent(
        name="Todo Assistant",
        instructions=get_system_prompt(language=language),
        model=OPENAI_MODEL,
        tools=[
            add_task_tool,
            list_tasks_tool,
            complete_task_tool,
            delete_task_tool,
            update_task_tool,
        ]
    )


def process_chat_message(
    session: Session,
    user_id: str,
    message: str,
    conversation_history: Optional[List[dict]] = None,
) -> dict:
    """
    Process a chat message using the OpenAI Agents SDK.

    Args:
        session: Database session (not used directly, tools manage their own sessions)
        user_id: Authenticated user ID
        message: User's message
        conversation_history: Previous messages in the conversation

    Returns:
        Dictionary with response and any tool calls made
    """
    # Create agent for this user
    agent = create_agent(user_id)

    # Build input messages
    messages = []
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": message})

    # Run the agent
    result = Runner.run_sync(agent, messages)

    # Extract the final response
    response_text = ""
    tool_calls = []

    # Get the final output from the agent
    if result.final_output:
        response_text = result.final_output
    else:
        # Fallback to last message content
        for item in reversed(result.new_items):
            if hasattr(item, 'content') and item.content:
                response_text = item.content
                break

    # Collect tool calls made
    for item in result.new_items:
        if hasattr(item, 'name') and hasattr(item, 'arguments'):
            tool_calls.append({
                "tool": item.name,
                "arguments": item.arguments if isinstance(item.arguments, dict) else {},
                "result": getattr(item, 'output', None)
            })

    return {
        "response": response_text or "I processed your request.",
        "tool_calls": tool_calls,
    }
