# Todo App - Phase 3 Specification Overview

## Project Summary
An AI-powered todo application that extends Phase 2 with a conversational chatbot interface. Users can manage tasks through natural language commands using an AI assistant powered by OpenAI Agents SDK and MCP (Model Context Protocol).

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Chat UI | OpenAI ChatKit |
| Backend | Python FastAPI |
| AI Agent | OpenAI Agents SDK |
| Tool Protocol | MCP (Model Context Protocol) |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth + JWT |
| Styling | Tailwind CSS |

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────┐     ┌─────────────────┐
│    Frontend     │────>│              Backend                │────>│    Database     │
│   (Next.js)     │     │            (FastAPI)                │     │     (Neon)      │
│   Port: 3000    │     │           Port: 8000                │     │   PostgreSQL    │
│                 │     │                                     │     │                 │
│  ┌───────────┐  │     │  ┌─────────┐    ┌──────────────┐   │     │                 │
│  │ ChatKit   │──┼─────┼─>│ Agent   │───>│  MCP Server  │   │     │                 │
│  │    UI     │  │     │  │ (OpenAI)│    │   (Tools)    │───┼─────┤                 │
│  └───────────┘  │     │  └─────────┘    └──────────────┘   │     │                 │
│                 │     │                                     │     │                 │
│  ┌───────────┐  │     │  ┌─────────────────────────────┐   │     │                 │
│  │  Task UI  │──┼─────┼─>│      REST API (Tasks)       │───┼─────┤                 │
│  └───────────┘  │     │  └─────────────────────────────┘   │     │                 │
└─────────────────┘     └─────────────────────────────────────┘     └─────────────────┘
```

## Core Features

### Existing (from Phase 2)
- Task CRUD operations
- User authentication (Better Auth + JWT)
- Task filtering and search
- Priority levels and due dates

### New (Phase 3)
- **AI Chatbot Interface**: Natural language task management via OpenAI ChatKit
- **Smart Reminders**: Set alarms by voice or text ("remind me in 1 hour", "alarm at 5 PM")
- **Voice Commands**: Microphone input in the AI chat panel
- **Browser Notifications**: Push notifications when reminders trigger
- **Multi-language Support**: English and Urdu
- **PWA**: Installable as mobile/desktop app with offline caching
- **MCP Tools**: add_task, list_tasks, complete_task, delete_task, update_task
- **Conversation History**: Stored in database for persistence
- **Timezone-aware Reminders**: UTC-based with user timezone offset for accurate alarm times

## MCP Tools Specification

| Tool | Description | Parameters |
|------|-------------|------------|
| `add_task` | Create a new task | title, description?, priority?, due_date?, reminder_time? |
| `list_tasks` | List user's tasks | filter?, status?, priority? |
| `complete_task` | Mark task as complete | task_id |
| `delete_task` | Delete a task | task_id |
| `update_task` | Update task details | task_id, title?, description?, priority?, due_date?, reminder_time?, status? |

## Specification Documents

| Document | Description |
|----------|-------------|
| [features/task-crud.md](features/task-crud.md) | Task CRUD user stories |
| [features/authentication.md](features/authentication.md) | Authentication flow |
| [features/ai-chatbot.md](features/ai-chatbot.md) | AI Chatbot specification |
| [api/rest-endpoints.md](api/rest-endpoints.md) | REST API documentation |
| [api/mcp-tools.md](api/mcp-tools.md) | MCP tools documentation |
| [database/schema.md](database/schema.md) | Database schema |
| [ui/components.md](ui/components.md) | UI components |

## Environment Configuration

### Frontend (.env.local)
```
DATABASE_URL=<neon-postgresql-url>
BETTER_AUTH_SECRET=<shared-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=<neon-postgresql-url>
BETTER_AUTH_SECRET=<shared-secret>
OPENAI_API_KEY=<openai-api-key>
```

## Development

### Start Frontend
```bash
cd frontend
npm run dev
```

### Start Backend
```bash
cd backend
.venv\Scripts\activate
uvicorn src.main:app --reload
```
