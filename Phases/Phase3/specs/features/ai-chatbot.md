# AI Chatbot Feature Specification

## Overview
The AI Chatbot provides a natural language interface for managing todos. Users can create, view, update, complete, and delete tasks through conversational commands.

## User Stories

### US-301: Chat with AI Assistant
**As a** user
**I want to** chat with an AI assistant
**So that** I can manage my tasks using natural language

**Acceptance Criteria:**
- [ ] Chat interface is accessible from the main dashboard
- [ ] User can type messages in a text input
- [ ] AI responds with helpful task management assistance
- [ ] Conversation history is preserved across page refreshes
- [ ] Chat works on both desktop and mobile

### US-302: Create Task via Chat
**As a** user
**I want to** create tasks by telling the AI what I need to do
**So that** I can quickly add tasks without using forms

**Acceptance Criteria:**
- [ ] User can say "Add a task to buy groceries"
- [ ] AI extracts task title from natural language
- [ ] AI asks for missing required fields (due date)
- [ ] AI confirms task creation with details
- [ ] Task appears in the task list immediately

**Example Conversations:**
```
User: "Add a task to buy groceries tomorrow"
AI: "I've created a task 'Buy groceries' due tomorrow. Would you like to set a priority?"

User: "Create a high priority task to finish the report by Friday"
AI: "Done! I've added 'Finish the report' with high priority, due Friday."
```

### US-303: List Tasks via Chat
**As a** user
**I want to** ask the AI to show my tasks
**So that** I can quickly see what I need to do

**Acceptance Criteria:**
- [ ] User can ask "What are my tasks?"
- [ ] AI lists tasks with title, priority, due date
- [ ] User can filter by asking "Show my high priority tasks"
- [ ] User can ask "What's due today?"

**Example Conversations:**
```
User: "What do I have to do today?"
AI: "You have 3 tasks due today:
1. Buy groceries (medium priority)
2. Call dentist (high priority)
3. Review documents (low priority)"

User: "Show me all high priority tasks"
AI: "Here are your high priority tasks:
1. Call dentist - due today
2. Finish report - due Friday"
```

### US-304: Complete Task via Chat
**As a** user
**I want to** mark tasks as complete by telling the AI
**So that** I can quickly update task status

**Acceptance Criteria:**
- [ ] User can say "Mark buy groceries as done"
- [ ] AI finds matching task and marks complete
- [ ] AI confirms completion
- [ ] If multiple matches, AI asks to clarify

**Example Conversations:**
```
User: "I finished buying groceries"
AI: "Great! I've marked 'Buy groceries' as complete."

User: "Complete the report task"
AI: "Done! 'Finish the report' is now complete."
```

### US-305: Delete Task via Chat
**As a** user
**I want to** delete tasks by telling the AI
**So that** I can remove tasks I no longer need

**Acceptance Criteria:**
- [ ] User can say "Delete the groceries task"
- [ ] AI asks for confirmation before deleting
- [ ] AI confirms deletion
- [ ] Task is removed from list

**Example Conversations:**
```
User: "Remove the call dentist task"
AI: "Are you sure you want to delete 'Call dentist'?"
User: "Yes"
AI: "Done! I've deleted the task."
```

### US-306: Update Task via Chat
**As a** user
**I want to** update task details through chat
**So that** I can modify tasks conversationally

**Acceptance Criteria:**
- [ ] User can change task title, description, priority, due date
- [ ] AI confirms what was changed
- [ ] Changes reflect in task list immediately

**Example Conversations:**
```
User: "Change the groceries task to high priority"
AI: "Updated! 'Buy groceries' is now high priority."

User: "Move the report deadline to next Monday"
AI: "Done! 'Finish the report' is now due next Monday."
```

## Technical Requirements

### Chat API Endpoint
```
POST /api/chat
Authorization: Bearer <jwt-token>

Request:
{
  "message": "Add a task to buy groceries",
  "conversation_id": "uuid" (optional)
}

Response:
{
  "response": "I've created a task 'Buy groceries'. When is it due?",
  "conversation_id": "uuid",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": { "title": "Buy groceries" },
      "result": { "id": 123, "title": "Buy groceries", ... }
    }
  ]
}
```

### Database Schema Addition
```sql
-- Conversation history table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Message history table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'tool'
  content TEXT NOT NULL,
  tool_calls JSONB, -- For assistant tool calls
  tool_call_id VARCHAR(255), -- For tool results
  created_at TIMESTAMP DEFAULT NOW()
);
```

### MCP Tools Implementation

Each tool must:
1. Validate user authentication
2. Only access the authenticated user's tasks
3. Return structured results for the agent
4. Handle errors gracefully

```python
@mcp_tool
def add_task(
    title: str,
    description: str | None = None,
    priority: Literal["low", "medium", "high"] = "medium",
    due_date: str | None = None
) -> dict:
    """Create a new task for the user."""
    ...

@mcp_tool
def list_tasks(
    status: Literal["pending", "completed"] | None = None,
    priority: Literal["low", "medium", "high"] | None = None,
    due_today: bool = False
) -> list[dict]:
    """List the user's tasks with optional filters."""
    ...

@mcp_tool
def complete_task(task_id: int) -> dict:
    """Mark a task as completed."""
    ...

@mcp_tool
def delete_task(task_id: int) -> dict:
    """Delete a task."""
    ...

@mcp_tool
def update_task(
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    priority: Literal["low", "medium", "high"] | None = None,
    due_date: str | None = None
) -> dict:
    """Update task details."""
    ...
```

### Agent System Prompt
```
You are a helpful todo assistant. You help users manage their tasks through natural conversation.

When users want to manage tasks, use the available tools:
- add_task: Create new tasks
- list_tasks: Show user's tasks
- complete_task: Mark tasks as done
- delete_task: Remove tasks
- update_task: Modify task details

Guidelines:
- Be concise and friendly
- Confirm actions after completing them
- Ask for clarification if the request is ambiguous
- For due dates, interpret natural language (e.g., "tomorrow", "next Friday")
- Always respect that you can only access the current user's tasks
```

## UI Components

### ChatPanel Component
- Collapsible panel on the right side of dashboard
- Shows conversation history
- Text input at bottom
- Send button and Enter key support
- Loading indicator while AI responds
- Auto-scroll to latest message

### ChatMessage Component
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, gray background
- Tool results: Subtle indication of action taken
- Timestamp on hover

## Non-Functional Requirements

- **Response Time**: AI should respond within 3 seconds
- **History Limit**: Store last 100 messages per conversation
- **Rate Limiting**: Max 30 messages per minute per user
- **Error Handling**: Graceful fallback if AI service unavailable
