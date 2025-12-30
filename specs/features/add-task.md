# Feature: Add Task

---

## Context
Users need the ability to create new todo items to track things they need to accomplish. This is a core Phase 1 Basic Level feature that forms the foundation of the todo application. Without the ability to add tasks, no other features can function.

---

## User Stories

- As a user, I want to add a task with a title, so that I can remember things I need to do
- As a user, I want to optionally add a description to a task, so that I can provide more context and details
- As a user, I want tasks to be automatically assigned an ID, so that I can reference them later
- As a user, I want to see a confirmation when a task is created, so that I know it was successful
- As a user, I want to see clear error messages if my input is invalid, so that I understand what went wrong

---

## Data Schema

### Task Model
```
Task {
  id: int (auto-generated, unique, starts from 1) - Unique identifier for the task
  title: str (required, 1-200 chars) - Brief description of what needs to be done
  description: str | None (optional, max 1000 chars) - Additional details about the task
  status: TaskStatus (default: PENDING) - Current state: PENDING or COMPLETED
  created_at: datetime (auto-generated) - When the task was created
  updated_at: datetime (auto-generated) - When the task was last modified
}
```

**TaskStatus Enum:**
```
TaskStatus {
  PENDING: "pending"
  COMPLETED: "completed"
}
```

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can create a task with only a title
- [ ] User can create a task with both title and description
- [ ] Task ID is auto-assigned starting from 1 and incrementing
- [ ] New tasks default to PENDING status
- [ ] Timestamps (created_at, updated_at) are automatically set to current time
- [ ] Task is stored in the in-memory repository
- [ ] User receives task object with all fields populated

### Validation Rules
- [ ] Title is required (cannot be empty or None)
- [ ] Title must be between 1 and 200 characters
- [ ] Description is optional (can be None)
- [ ] Description, if provided, must not exceed 1000 characters
- [ ] Pydantic validation automatically enforces these rules

### Error Handling
- [ ] Empty title raises ValidationError with message: "Title is required"
- [ ] Title over 200 chars raises ValidationError with message about character limit
- [ ] Description over 1000 chars raises ValidationError with message about character limit
- [ ] All validation errors are caught and returned with user-friendly messages

### User Experience
- [ ] Success message shows: "Task '[title]' (ID: {id}) created successfully"
- [ ] Success message is displayed with green color using Rich
- [ ] Error messages are displayed with red color using Rich
- [ ] Task details are formatted clearly in the terminal

---

## Example Usage

### Happy Path Example 1: Title Only
```
Input:
  title = "Buy groceries"
  description = None

Output:
  ✓ Task 'Buy groceries' (ID: 1) created successfully

  ID: 1
  Title: Buy groceries
  Status: Pending
  Created: 2024-12-30 10:30:45
```

### Happy Path Example 2: Title and Description
```
Input:
  title = "Finish homework"
  description = "Complete math assignment pages 45-50"

Output:
  ✓ Task 'Finish homework' (ID: 2) created successfully

  ID: 2
  Title: Finish homework
  Description: Complete math assignment pages 45-50
  Status: Pending
  Created: 2024-12-30 10:31:12
```

### Error Example 1: Empty Title
```
Input:
  title = ""
  description = "Some description"

Output:
  ✗ Error: Title is required and must be between 1 and 200 characters
```

### Error Example 2: Title Too Long
```
Input:
  title = "a" * 201
  description = None

Output:
  ✗ Error: Title must not exceed 200 characters
```

### Error Example 3: Description Too Long
```
Input:
  title = "Valid title"
  description = "a" * 1001

Output:
  ✗ Error: Description must not exceed 1000 characters
```

---

## Test Cases

1. **Test: Add task with valid title only**
   - Given: User provides title "Buy milk"
   - When: add_task() is called with title only
   - Then: Task is created with ID 1, title "Buy milk", description None, status PENDING

2. **Test: Add task with title and description**
   - Given: User provides title "Call dentist" and description "Schedule annual checkup"
   - When: add_task() is called with both parameters
   - Then: Task is created with both fields populated correctly

3. **Test: Task ID auto-increments**
   - Given: Repository is empty
   - When: Three tasks are created sequentially
   - Then: Tasks receive IDs 1, 2, 3 in order

4. **Test: Timestamps are auto-generated**
   - Given: User creates a task
   - When: add_task() is called
   - Then: created_at and updated_at are set to current datetime

5. **Test: Empty title raises validation error**
   - Given: User provides empty string as title
   - When: add_task() is called
   - Then: Pydantic ValidationError is raised

6. **Test: Title exceeding 200 characters raises validation error**
   - Given: User provides 201-character title
   - When: add_task() is called
   - Then: Pydantic ValidationError is raised

7. **Test: Description exceeding 1000 characters raises validation error**
   - Given: User provides 1001-character description
   - When: add_task() is called
   - Then: Pydantic ValidationError is raised

8. **Test: Title at boundary (200 chars) is accepted**
   - Given: User provides exactly 200-character title
   - When: add_task() is called
   - Then: Task is created successfully

9. **Test: Description at boundary (1000 chars) is accepted**
   - Given: User provides exactly 1000-character description
   - When: add_task() is called
   - Then: Task is created successfully

10. **Test: Default status is PENDING**
    - Given: User creates a new task
    - When: add_task() is called
    - Then: Task status is TaskStatus.PENDING

---

## Implementation Notes

### Architecture Layer Mapping
- **Model** (models.py):
  - Define `Task` Pydantic model with validation
  - Define `TaskStatus` enum
- **Repository** (repository.py):
  - Implement `create()` method to store task in dict
  - Implement ID auto-increment logic
- **Service** (service.py):
  - Implement `add_task(title, description)` method
  - Handle Pydantic validation errors
  - Return formatted response dict with success/error
- **CLI** (cli.py):
  - Implement `add` command
  - Parse user input for title and description
  - Display success/error messages with Rich formatting

### Dependencies
- **Pydantic v2**: For Task model and automatic validation
- **Rich**: For colored terminal output
- **datetime**: For timestamp generation (Python standard library)

### Future Compatibility
- **Phase 2 Migration**: Task model will add `user_id` field for multi-user support
- **Phase 2 Migration**: Repository `create()` will use SQLModel instead of dict
- **Phase 2 Migration**: Service layer business logic remains unchanged
- **Phase 3 Migration**: Add Task will become an MCP tool callable by AI agent

---

## Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage >= 80% for add_task functionality
- [ ] Architect skill validation passed
- [ ] All 10 test cases passing
- [ ] Code follows PEP 8 and has type hints

---

## Related Specifications

- [Project Overview](../overview.md)
- [Phase 1 Architecture](../architecture/phase1-architecture.md)
- [Constitution](../../constitution.md)
- [Spec Template](../../.spec-kit/templates/spec-template.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 30, 2024 | Claude (Spec-Gen) | Initial specification |

---

## Architect Review

**Status**: ✅ APPROVED

**Review Date**: December 30, 2024

**Feedback**:
- ✅ All sections complete and well-structured
- ✅ User stories follow standard format
- ✅ Data schema matches constitution perfectly
- ✅ Comprehensive test coverage (10 test cases)
- ✅ Clear error handling scenarios
- ✅ Proper layered architecture mapping
- ✅ Ready for implementation

**Approval Signature**: Architect Skill v1.0 (Dec 30, 2024)
