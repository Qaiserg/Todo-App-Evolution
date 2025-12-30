# Test-Gen Skill
## Automated Test Case Generation from Specifications

---

## Purpose
Generate comprehensive Pytest test cases from feature specifications, ensuring >80% code coverage.

---

## Usage

```
"Use the Test-Gen skill to generate tests for specs/features/[feature-name].md

Generate tests for:
- models.py → tests/test_models.py
- service.py → tests/test_service.py
- repository.py → tests/test_repository.py

Ensure >80% coverage"
```

---

## Test Generation Rules

### 1. One Acceptance Criterion = One or More Tests
Every spec acceptance criterion must have a corresponding test.

### 2. Test Naming Convention
```python
def test_{feature}_{scenario}_{expected_outcome}():
    """Test that {feature} {scenario} results in {expected_outcome}."""
```

### 3. Test Structure (AAA Pattern)
```python
def test_feature():
    # Arrange - Set up test data
    task = Task(id=1, title="Test")

    # Act - Execute the function
    result = service.add_task(task)

    # Assert - Verify the outcome
    assert result.id == 1
```

### 4. Use Fixtures for Common Setup
```python
@pytest.fixture
def sample_task():
    return Task(id=1, title="Sample", status=TaskStatus.PENDING)
```

### 5. Test Categories
- Functional Tests (core functionality)
- Validation Tests (input validation)
- Error Handling Tests (expected exceptions)
- Edge Case Tests (boundary values)

---

## Coverage Requirements

- **Overall**: 80%+
- **Models**: 100%
- **Repository**: 90%+
- **Service**: 85%+
- **CLI**: 70%+

### Running Coverage
```bash
pytest tests/ --cov=src --cov-report=term --cov-report=html
```

---

## Test Organization

```
tests/
├── conftest.py         # Shared fixtures
├── test_models.py      # Pydantic model tests
├── test_repository.py  # Storage tests
├── test_service.py     # Business logic tests
└── test_cli.py         # CLI tests
```

---

## Integration

1. Write spec
2. Validate spec (Architect)
3. Generate tests (Test-Gen) ← YOU ARE HERE
4. Generate implementation
5. Run tests → Iterate

---

**Last Updated**: December 30, 2024
