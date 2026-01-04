# Todo App Evolution

A multi-phase todo application demonstrating progressive enhancement from a simple console app to a full-featured system with AI integration. Built using **Spec-Driven Development** with Claude Code and Spec-Kit Plus.

## 🎯 Current Status: Phase 2 Complete

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Python Console App | ✅ Complete |
| Phase 2 | Full-Stack Web App (Next.js + FastAPI) | ✅ Complete |
| Phase 3 | AI Chatbot Integration | 🔜 Coming Soon |
| Phase 4 | MCP Server + Tools | 🔜 Planned |
| Phase 5 | AI Agent | 🔜 Planned |

---

## 🚀 Project Evolution

| Phase | Description | Link |
|-------|-------------|------|
| **Phase 1** | Python Console App with Rich CLI | [View Phase 1](./Phases/Phase1) |
| **Phase 2** | Full-Stack Web App with Better Auth | [View Phase 2](./Phases/Phase2) |

---

## 📁 Repository Structure

```
Todo-App-Evolution/
├── Phases/
│   ├── Phase1/              # Python Console Application
│   │   ├── cli.py           # Rich terminal UI
│   │   ├── service.py       # Business logic
│   │   ├── repository.py    # Data access
│   │   ├── models.py        # Pydantic models
│   │   ├── tests/           # 83 passing tests
│   │   └── specs/           # Phase 1 specifications
│   │
│   └── Phase2/              # Full-Stack Web Application
│       ├── frontend/        # Next.js 14 (App Router)
│       ├── backend/         # Python FastAPI
│       ├── specs/           # Phase 2 specifications
│       └── .spec-kit/       # Spec-Kit configuration
│
├── specs/                   # Project-wide specifications
├── .spec-kit/               # Global Spec-Kit config
├── constitution.md          # Project principles
└── README.md                # This file
```

---

## 🏗️ Technology Stack

### Phase 1: Console App
| Component | Technology |
|-----------|------------|
| Language | Python 3.11+ |
| CLI | Rich |
| Validation | Pydantic v2 |
| Testing | Pytest (83 tests) |
| Storage | In-memory |

### Phase 2: Web App
| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Python FastAPI |
| Database | Neon PostgreSQL |
| ORM | SQLModel |
| Auth | Better Auth + JWT |
| Styling | Tailwind CSS |

---

## 🔐 Phase 2: Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   FastAPI   │────▶│    Neon     │
│  (Frontend) │ JWT │  (Backend)  │     │ PostgreSQL  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │  BETTER_AUTH_SECRET (shared)
       └───────────────────┘
```

- User signs up/in via Better Auth
- JWT token issued for API calls
- Backend verifies JWT with shared secret
- User isolation enforced on all endpoints

---

## 🚀 Quick Start

### Phase 1 (Console App)
```bash
cd Phases/Phase1
uv sync --extra dev
uv run python -m main
```

### Phase 2 (Web App)
```bash
# Terminal 1: Frontend
cd Phases/Phase2/frontend
npm install
npm run dev

# Terminal 2: Backend
cd Phases/Phase2/backend
pip install -r requirements.txt
uvicorn src.main:app --reload
```

---

## 📋 API Endpoints (Phase 2)

All endpoints require JWT authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{id}` | Get task details |
| PUT | `/api/{user_id}/tasks/{id}` | Update a task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete a task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

---

## 📖 Development Approach

This project follows **Spec-Driven Development** using:

1. **Spec-Kit Plus** - Organized specifications
2. **Claude Code** - AI-assisted development
3. **Monorepo** - Frontend + Backend in single context

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🔗 Links

- **Repository**: https://github.com/Qaiserg/Todo-App-Evolution
- **Phase 1**: [Phases/Phase1](./Phases/Phase1)
- **Phase 2**: [Phases/Phase2](./Phases/Phase2)

---

**Last Updated**: January 2026
**Current Phase**: 2 of 5
