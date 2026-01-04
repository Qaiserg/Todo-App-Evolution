# Todo App - Phase II (Hackathon)

## Project Overview
This is a monorepo using GitHub Spec-Kit for spec-driven development.
Full-stack todo application with Better Auth authentication.

## Spec-Kit Structure
Specifications are organized in /specs:
- /specs/overview.md - Project overview
- /specs/features/ - Feature specs (what to build)
- /specs/api/ - API endpoint specs
- /specs/database/ - Schema and model specs
- /specs/ui/ - Component and page specs

## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: @specs/features/task-crud.md
3. Update specs if requirements change

## Project Structure
```
Phase2/
├── .spec-kit/           # Spec-Kit configuration
│   └── config.yaml
├── specs/               # Spec-Kit managed specifications
│   ├── overview.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── frontend/            # Next.js 14 app
│   └── CLAUDE.md
├── backend/             # Python FastAPI server
│   └── CLAUDE.md
└── CLAUDE.md            # This file
```

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth + JWT |

## Authentication Flow
1. User signs up/in via Better Auth (frontend)
2. Frontend generates HS256 JWT token for API calls
3. Backend verifies JWT using shared secret (BETTER_AUTH_SECRET)
4. User ID in token must match user_id in URL

## API Endpoints (RESTful)
All endpoints require JWT token in Authorization header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tasks | List all tasks for user |
| POST | /api/{user_id}/tasks | Create a new task |
| GET | /api/{user_id}/tasks/{id} | Get task details |
| PUT | /api/{user_id}/tasks/{id} | Update a task |
| DELETE | /api/{user_id}/tasks/{id} | Delete a task |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion |

## Development Workflow
1. Read spec: @specs/features/[feature].md
2. Implement backend: @backend/CLAUDE.md
3. Implement frontend: @frontend/CLAUDE.md
4. Test and iterate

## Commands
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && .venv\Scripts\activate && uvicorn src.main:app --reload`

## Environment Variables
Both frontend and backend require:
```
DATABASE_URL=<neon-postgresql-url>
BETTER_AUTH_SECRET=<shared-secret-for-jwt>
```

## Features (Phase 2)
1. User Authentication (signup/signin/signout)
2. Add Task - Create new todos via web form
3. View Tasks - Display tasks in responsive list
4. Update Task - Edit task title/description/priority
5. Mark Complete - Toggle completion status
6. Delete Task - Remove tasks with confirmation
7. Filter & Search - By status, priority, date, text
