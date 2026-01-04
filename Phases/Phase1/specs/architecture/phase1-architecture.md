# Phase 1 Architecture
## Python Console Todo Application

---

## Overview
Console-based todo app with in-memory storage using layered architecture.

---

## Layered Architecture

```
┌──────────────────────────────────┐
│  CLI Layer (cli.py)              │
│  - Rich terminal UI              │
│  - User input/output             │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Service Layer (service.py)      │
│  - Business logic                │
│  - Task operations               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Repository Layer (repository.py)│
│  - In-memory storage (dict)      │
│  - CRUD operations               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Model Layer (models.py)         │
│  - Pydantic Task model           │
│  - Validation rules              │
└──────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. Model Layer (models.py)
- Define Task Pydantic model
- TaskStatus enum (PENDING, COMPLETED)
- Input validation

### 2. Repository Layer (repository.py)
- Abstract storage operations
- In-memory dict storage
- CRUD interface: create, read, update, delete, list

### 3. Service Layer (service.py)
- Business logic
- Task operations
- Error handling
- Response formatting

### 4. CLI Layer (cli.py)
- User interaction
- Command parsing
- Rich terminal output

---

## Migration Path to Phase 2

```
Phase 1 → Phase 2

cli.py          → Next.js Frontend
service.py      → FastAPI Endpoints (UNCHANGED!)
repository.py   → SQLModel + Database
models.py       → SQLModel (add inheritance)
```

**Key**: Service layer stays the same!

---

## Storage (Phase 1)

```python
class TaskRepository:
    def __init__(self):
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def create(self, task: Task) -> Task
    def read(self, task_id: int) -> Task | None
    def read_all() -> list[Task]
    def update(self, task_id: int, updates: dict) -> Task | None
    def delete(self, task_id: int) -> bool
```

**Limitations**: No persistence, data lost on exit
**Benefits**: Fast, simple, easy to test, clean migration path

---

## Testing Strategy

- **Models**: Test Pydantic validation
- **Repository**: Test CRUD operations
- **Service**: Test business logic
- **CLI**: Test user interactions

**Coverage Target**: >= 80%

---

## Success Criteria

- [ ] All layers clearly separated
- [ ] No circular dependencies
- [ ] Service independent of CLI
- [ ] Repository enables easy swapping
- [ ] Type hints on all functions
- [ ] Tests for each layer
- [ ] Coverage >= 80%

---

## Related Documents
- [Constitution](../../constitution.md)
- [Overview](../overview.md)
- [Architect Skill](../../.spec-kit/skills/architect.md)

---

**Last Updated**: December 30, 2024
**Status**: Ready for Implementation
**Architect Approval**: ✅
