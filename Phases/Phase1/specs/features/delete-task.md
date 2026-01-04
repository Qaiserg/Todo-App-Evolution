# Feature: Delete Task

---

## Context
Users need the ability to remove tasks from their todo list when they are no longer relevant, were created by mistake, or have been completed and are no longer needed. This is a core Phase 1 Basic Level feature that enables proper task lifecycle management and keeps the task list clean and organized.

---

## User Stories

- As a user, I want to delete a task by its ID, so that I can remove items I no longer need
- As a user, I want to see a confirmation when a task is deleted, so that I know the operation succeeded
- As a user, I want to see the task title in the confirmation, so that I can verify I deleted the correct task
- As a user, I want to see a clear error if I try to delete a non-existent task, so that I understand what went wrong
- As a user, I want to see a clear error if I provide an invalid ID, so that I know how to fix my input

---

## Data Schema

### Task Model (Reference)
```
Task {
  id: int (unique) - Used to identify which task to delete
  title: str - Shown in confirmation message
  ... (other fields not directly used in deletion)
}
```

**Note**: Deletion removes the entire task object from the repository.

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can delete a task by providing its ID
- [ ] Task is completely removed from the repository after deletion
- [ ] Deleted task ID can be reused for new tasks (counter continues incrementing)
- [ ] Deletion is permanent (no undo in Phase 1)

### Validation Rules
- [ ] Task ID must be a valid integer
- [ ] Task ID must exist in the repository
- [ ] Task ID must be greater than 0

### Error Handling
- [ ] Show error "Task with ID {id} not found" if task doesn't exist
- [ ] Show error "Invalid task ID" if ID is not a valid integer
- [ ] Show error "Task ID must be a positive number" if ID is 0 or negative
- [ ] Handle gracefully when deleting from empty repository

### User Experience
- [ ] Success message shows: "Task '{title}' (ID: {id}) deleted successfully"
- [ ] Success messages displayed with green color using Rich
- [ ] Error messages displayed with red color using Rich
- [ ] Confirmation includes the task title for verification

---

## Example Usage

### Happy Path Example 1: Delete Existing Task
```
Input:
  task_id = 5
  (Task 5 exists with title "Buy groceries")

Output:
  ✓ Task 'Buy groceries' (ID: 5) deleted successfully
```

### Happy Path Example 2: Delete First Task
```
Input:
  task_id = 1
  (Task 1 exists with title "First task")

Output:
  ✓ Task 'First task' (ID: 1) deleted successfully
```

### Error Example 1: Non-existent Task
```
Input:
  task_id = 999
  (Task 999 does not exist)

Output:
  ✗ Error: Task with ID 999 not found
```

### Error Example 2: Invalid ID (String)
```
Input:
  task_id = "abc"

Output:
  ✗ Error: Invalid task ID. Please provide a valid number.
```

### Error Example 3: Zero or Negative ID
```
Input:
  task_id = 0

Output:
  ✗ Error: Task ID must be a positive number
```

### Error Example 4: Delete from Empty Repository
```
Input:
  task_id = 1
  (Repository is empty)

Output:
  ✗ Error: Task with ID 1 not found
```

---

## Test Cases

1. **Test: Delete existing task removes it from repository**
   - Given: Task with ID 5 exists in repository
   - When: delete_task(5) is called
   - Then: Task is removed and success response returned

2. **Test: Delete task returns task details in response**
   - Given: Task with ID 3 exists with title "Call dentist"
   - When: delete_task(3) is called
   - Then: Response includes task ID and title

3. **Test: Delete non-existent task returns error**
   - Given: Task with ID 999 does not exist
   - When: delete_task(999) is called
   - Then: Error response with "not found" message

4. **Test: Delete with invalid ID type returns error**
   - Given: User provides string "abc" as ID
   - When: delete_task("abc") is called
   - Then: Error response with "invalid" message

5. **Test: Delete with zero ID returns error**
   - Given: User provides ID 0
   - When: delete_task(0) is called
   - Then: Error response with "positive number" message

6. **Test: Delete with negative ID returns error**
   - Given: User provides ID -5
   - When: delete_task(-5) is called
   - Then: Error response with "positive number" message

7. **Test: Repository count decreases after deletion**
   - Given: Repository has 5 tasks
   - When: delete_task(3) is called
   - Then: Repository has 4 tasks remaining

8. **Test: Other tasks remain unchanged after deletion**
   - Given: Repository has tasks 1, 2, 3
   - When: delete_task(2) is called
   - Then: Tasks 1 and 3 still exist unchanged

9. **Test: Can delete the only task in repository**
   - Given: Repository has only one task (ID 1)
   - When: delete_task(1) is called
   - Then: Repository becomes empty

10. **Test: Delete from empty repository returns error**
    - Given: Repository is empty
    - When: delete_task(1) is called
    - Then: Error response with "not found" message

---

## Implementation Notes

### Architecture Layer Mapping
- **Model** (models.py):
  - No changes needed (uses existing Task model)
- **Repository** (repository.py):
  - Already has `delete(task_id: int) -> bool` method
  - Already has `exists(task_id: int) -> bool` method
- **Service** (service.py):
  - Implement `delete_task(task_id: int) -> dict` method
  - Validate task_id is positive integer
  - Check if task exists before deleting
  - Return formatted response with success/error
- **CLI** (cli.py):
  - Implement `delete` command
  - Parse task ID from user input
  - Handle type conversion (string → int)
  - Display success/error messages with Rich formatting

### Dependencies
- **Repository methods**: `delete()`, `exists()`, `read()` (to get title for confirmation)
- **Rich**: For colored terminal output
- **Type conversion**: Handle string → int conversion with error handling

### Future Compatibility
- **Phase 2 Migration**: Will use SQLModel DELETE query instead of dict deletion
- **Phase 2 Enhancement**: May add soft delete (mark as deleted vs. hard delete)
- **Phase 3 Migration**: Delete Task becomes MCP tool for AI agent
- **Phase 3 Enhancement**: May add "undo" functionality with task recovery

---

## Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage >= 80% for delete_task functionality
- [ ] Architect skill validation passed
- [ ] All 10 test cases passing
- [ ] Code follows PEP 8 and has type hints
- [ ] Integration with existing add_task works seamlessly

---

## Related Specifications

- [Add Task](./add-task.md) - Related CRUD operation
- [Project Overview](../overview.md)
- [Phase 1 Architecture](../architecture/phase1-architecture.md)
- [Constitution](../../constitution.md)

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
- ✅ Excellent error handling coverage (invalid, non-existent, zero/negative IDs)
- ✅ Leverages existing repository methods efficiently
- ✅ Comprehensive test coverage (10 test cases)
- ✅ Clear integration with existing features
- ✅ Proper layered architecture mapping
- ✅ Ready for implementation

**Approval Signature**: Architect Skill v1.0 (Dec 30, 2024)
