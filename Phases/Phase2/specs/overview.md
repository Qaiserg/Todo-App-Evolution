# Todo App - Phase 2 Specification Overview

## Project Summary
A full-stack todo application with user authentication and task management.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth |
| Styling | Tailwind CSS + shadcn/ui |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────>│     Backend     │────>│    Database     │
│   (Next.js)     │     │   (FastAPI)     │     │     (Neon)      │
│   Port: 3000    │     │   Port: 8000    │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │   JWT Token           │
        └───────────────────────┘
```

## Authentication Flow

1. User signs up/in via Better Auth (frontend)
2. Better Auth creates session and issues JWT
3. Frontend fetches JWT token for API calls
4. Backend verifies JWT using shared secret
5. User ID in token must match URL parameter

## Core Features

### Task Management
- Create, read, update, delete tasks
- Mark tasks as complete
- Set priority (low/medium/high)
- Set due dates
- Filter by status, priority, date range
- Search tasks by title/description

### User Authentication
- Email/password registration
- Email/password login
- Persistent sessions (7 days)
- Secure logout

## Specification Documents

| Document | Description |
|----------|-------------|
| [features/task-crud.md](features/task-crud.md) | Task CRUD user stories and acceptance criteria |
| [features/authentication.md](features/authentication.md) | Authentication flow and security requirements |
| [api/rest-endpoints.md](api/rest-endpoints.md) | REST API endpoint documentation |
| [database/schema.md](database/schema.md) | Database tables and schema |
| [ui/components.md](ui/components.md) | UI component specifications |
| [ui/pages.md](ui/pages.md) | Page routes and navigation |

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
