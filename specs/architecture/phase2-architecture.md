# Phase 2 Architecture
## SQLModel + Database Persistence

---

## Overview
Evolve from in-memory storage to SQLite database with SQLModel ORM while maintaining the existing layered architecture.

---

## Evolution from Phase 1

```
Phase 1 (In-Memory)          →    Phase 2 (Database)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cli.py (Rich UI)             →    cli.py (UNCHANGED)
service.py (Business Logic)  →    service.py (UNCHANGED)
repository.py (dict storage) →    repository.py (SQLModel)
models.py (Pydantic)         →    models.py (SQLModel + Pydantic)
                             +    database.py (NEW - DB connection)
```

**Key Principle**: Service layer stays the same! Repository abstracts storage.

---

## Updated Layered Architecture

```
┌──────────────────────────────────┐
│  CLI Layer (cli.py)              │
│  - Rich terminal UI              │
│  - User input/output             │
│  - Interactive menu (1-7)        │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Service Layer (service.py)      │
│  - Business logic (UNCHANGED!)   │
│  - Task operations               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Repository Layer (repository.py)│
│  - SQLModel ORM operations       │
│  - Database CRUD                 │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Database Layer (database.py)    │  ← NEW
│  - SQLite connection             │
│  - Session management            │
│  - Engine configuration          │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Model Layer (models.py)         │
│  - SQLModel Task model           │
│  - Pydantic validation           │
│  - Database table mapping        │
└──────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| ORM | SQLModel | Combines SQLAlchemy + Pydantic |
| Database | Neon PostgreSQL | Serverless PostgreSQL cloud database |
| Validation | Pydantic v2 | Input validation (via SQLModel) |
| Testing | Pytest | With in-memory SQLite for tests |

---

## Model Changes (models.py)

### Before (Phase 1 - Pydantic only)
```python
from pydantic import BaseModel

class Task(BaseModel):
    id: int | None = None
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime
    updated_at: datetime
```

### After (Phase 2 - SQLModel)
```python
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

**Benefits**: Same validation, same API, now with database mapping!

---

## New Database Layer (database.py)

```python
from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///todo.db"
engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
```

---

## Repository Changes (repository.py)

### Interface (UNCHANGED!)
```python
class TaskRepository:
    def create(self, task: Task) -> Task
    def read(self, task_id: int) -> Task | None
    def read_all(self) -> list[Task]
    def update(self, task_id: int, updates: dict) -> Task | None
    def delete(self, task_id: int) -> bool
```

### Implementation (NEW - SQLModel)
```python
class TaskRepository:
    def __init__(self, session: Session):
        self._session = session

    def create(self, task: Task) -> Task:
        self._session.add(task)
        self._session.commit()
        self._session.refresh(task)
        return task

    def read(self, task_id: int) -> Task | None:
        return self._session.get(Task, task_id)

    def read_all(self) -> list[Task]:
        return self._session.exec(select(Task)).all()

    def update(self, task_id: int, updates: dict) -> Task | None:
        task = self._session.get(Task, task_id)
        if task:
            for key, value in updates.items():
                setattr(task, key, value)
            task.updated_at = datetime.now()
            self._session.commit()
            self._session.refresh(task)
        return task

    def delete(self, task_id: int) -> bool:
        task = self._session.get(Task, task_id)
        if task:
            self._session.delete(task)
            self._session.commit()
            return True
        return False
```

---

## Database File Location

```
D:\Todo_App\
├── todo.db              ← SQLite database file (created at runtime)
├── src/
│   ├── models.py        ← SQLModel Task model
│   ├── database.py      ← NEW: Database connection
│   ├── repository.py    ← Updated: SQLModel operations
│   ├── service.py       ← UNCHANGED
│   ├── cli.py           ← UNCHANGED
│   └── main.py          ← Minor: Initialize DB on startup
```

---

## Testing Strategy

### Test Database Isolation
```python
# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def session():
    engine = create_engine(TEST_DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
```

### Test Categories
- **Models**: SQLModel validation + table creation
- **Repository**: Database CRUD operations
- **Service**: Business logic (unchanged tests!)
- **Integration**: End-to-end with real database

---

## Migration Steps

1. Add SQLModel dependency to pyproject.toml
2. Create database.py with engine and session
3. Update models.py to use SQLModel
4. Update repository.py for database operations
5. Update main.py to initialize database on startup
6. Update test fixtures for database sessions
7. Run all tests to verify functionality
8. Test persistence (data survives restart)

---

## Success Criteria

- [ ] Tasks persist after app restart
- [ ] All 83 existing tests still pass
- [ ] SQLite database file created at todo.db
- [ ] Service layer unchanged
- [ ] CLI interface unchanged
- [ ] Coverage >= 80%

---

## Backward Compatibility

| Feature | Phase 1 | Phase 2 | Compatible |
|---------|---------|---------|------------|
| Add Task | ✅ | ✅ | ✅ |
| View Tasks | ✅ | ✅ | ✅ |
| Update Task | ✅ | ✅ | ✅ |
| Mark Complete | ✅ | ✅ | ✅ |
| Delete Task | ✅ | ✅ | ✅ |
| Data Persistence | ❌ | ✅ | ✅ (enhanced) |

---

**Last Updated**: December 31, 2025
**Status**: Ready for Implementation
**Phase**: 2 of 5
