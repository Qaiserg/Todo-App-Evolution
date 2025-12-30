# Todo App Evolution

A multi-phase todo application demonstrating progressive enhancement from a simple console app to a full-featured system with AI integration.

## 🎯 Current Status: Phase 1 Complete

**Phase 1**: Python Console Application with 5 core features
- ✅ 83 tests passing
- ✅ Clean layered architecture
- ✅ Full spec-driven development

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Qaiserg/Todo-App-Evolution.git
cd Todo-App-Evolution

# Install dependencies
uv sync --extra dev

# Run the application
uv run python -m src.main

# Run tests
uv run pytest tests/ -v
```

### Prerequisites
- Python 3.11+
- [UV](https://github.com/astral-sh/uv) package manager

---

## 📋 Features (Phase 1)

### Add Task
Create new tasks with title and optional description
```bash
> add Shopping
> add "Buy groceries" "Milk, eggs, bread"
```

### View Tasks
Display tasks with filtering options
```bash
> view              # All tasks
> view pending      # Only pending
> view completed    # Only completed
```

### Update Task
Modify task fields
```bash
> update 1 title "New title"
> update 1 status completed
> update 2 description "Updated description"
```

### Mark Complete
Quick status update
```bash
> complete 1
```

### Delete Task
Remove tasks by ID
```bash
> delete 1
```

---

## 🏗️ Architecture

### Layered Design
```
┌─────────────────────────────────────┐
│         CLI Layer (cli.py)          │  ← Rich terminal UI
├─────────────────────────────────────┤
│      Service Layer (service.py)     │  ← Business logic
├─────────────────────────────────────┤
│   Repository Layer (repository.py)  │  ← Data access
├─────────────────────────────────────┤
│       Model Layer (models.py)       │  ← Pydantic validation
└─────────────────────────────────────┘
```

### Key Design Patterns
- **Repository Pattern**: Abstraction for easy storage migration
- **Service Layer**: Business logic isolation
- **Dependency Injection**: Testable components
- **Type Safety**: Full type hints and Pydantic validation

---

## 📁 Project Structure

```
Todo-App-Evolution/
├── src/                    # Application source code
│   ├── models.py          # Pydantic data models
│   ├── repository.py      # In-memory storage
│   ├── service.py         # Business logic
│   ├── cli.py             # Terminal UI (Rich)
│   └── main.py            # Entry point
├── tests/                  # Test suite (83 tests)
│   ├── test_models.py     # Model validation tests
│   ├── test_repository.py # Storage tests
│   └── test_service.py    # Business logic tests
├── specs/                  # Feature specifications
│   ├── features/          # Individual feature specs
│   └── architecture/      # Architecture documentation
├── .spec-kit/             # Development tools
│   ├── skills/            # Reusable development patterns
│   └── templates/         # Specification templates
├── Phases/                # Phase backups
│   └── Phase1-Complete/   # Phase 1 snapshot
├── constitution.md        # Project principles
├── pyproject.toml         # Dependencies
└── README.md              # This file
```

---

## 🧪 Testing

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ --cov=src --cov-report=term-missing

# Run specific test file
uv run pytest tests/test_service.py -v
```

### Test Coverage
- **Models**: 100% coverage (12 tests)
- **Repository**: 100% coverage (15 tests)
- **Service**: 94% coverage (56 tests)
- **Total**: 83 tests passing

---

## 🛠️ Technology Stack

### Phase 1
- **Language**: Python 3.13+
- **Package Manager**: UV
- **Data Validation**: Pydantic v2
- **Terminal UI**: Rich
- **Testing**: Pytest + pytest-cov
- **Storage**: In-memory (dict-based)

### Future Phases (Planned)
- **Phase 2**: SQLModel + SQLite/PostgreSQL
- **Phase 3**: MCP Server + Tool Integration
- **Phase 4**: FastAPI Backend + Frontend
- **Phase 5**: AI Agent Integration

---

## 📖 Development Workflow

This project follows a **spec-driven development** approach:

1. **Specification**: Write detailed feature specs
2. **Validation**: Review against architecture principles
3. **Test Generation**: Create comprehensive test suite
4. **Implementation**: Build features to pass tests
5. **Iteration**: Refine based on feedback

---

## 🎨 Code Style

- **PEP 8** compliant
- **Type hints** throughout
- **Docstrings** for all public methods
- **100% test coverage** target

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This is a learning project demonstrating progressive application development. Feel free to explore the code and specs!

---

## 🔗 Links

- **Repository**: https://github.com/Qaiserg/Todo-App-Evolution
- **Phase 1 Release**: [v1.0-phase1](https://github.com/Qaiserg/Todo-App-Evolution/releases/tag/v1.0-phase1)

---

**Last Updated**: December 30, 2025
**Current Phase**: 1 of 5
