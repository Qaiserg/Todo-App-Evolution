# Feature: Mark Complete

---

## Context
Users need a quick and convenient way to mark tasks as completed when they finish them. While the Update Task feature can change status, a dedicated "complete" command provides a better user experience for this common operation. This is a core Phase 1 Basic Level feature that streamlines task completion workflow.

---

## User Stories

- As a user, I want to mark a task as complete by its ID, so that I can quickly update finished tasks
- As a user, I want to see a confirmation when a task is marked complete, so that I know the operation succeeded
- As a user, I want to see the task title in the confirmation, so that I can verify I completed the correct task
- As a user, I want to see a clear error if I try to complete a non-existent task, so that I understand what went wrong
- As a user, I want to see a clear error if I provide an invalid ID, so that I know how to fix my input
- As a user, I want the updated_at timestamp to automatically update, so that I can track when tasks were completed

---

## Data Schema

### Task Model (Reference)
```
Task {
  id: int (unique, immutable) - Used to identify which task to complete
  title: str - Shown in confirmation message
  status: TaskStatus - Changed from PENDING to COMPLETED
  updated_at: datetime - Automatically updated to current time
  ... (other fields remain unchanged)
}
```

**Update Behavior**:
- Only status field is updated (PENDING → COMPLETED)
- updated_at automatically set to current datetime
- All other fields remain unchanged

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can mark a task as complete by providing its ID
- [ ] Status changes from PENDING to COMPLETED
- [ ] updated_at timestamp is automatically set to current time
- [ ] created_at, title, description remain unchanged
- [ ] Marking an already completed task succeeds (idempotent)

### Validation Rules
- [ ] Task ID must be a valid integer
- [ ] Task ID must exist in the repository
- [ ] Task ID must be greater than 0

### Error Handling
- [ ] Show error "Task with ID {id} not found" if task doesn't exist
- [ ] Show error "Invalid task ID" if ID is not a valid integer
- [ ] Show error "Task ID must be a positive number" if ID is 0 or negative

### User Experience
- [ ] Success message shows: "Task '{title}' (ID: {id}) marked as complete"
- [ ] Success messages displayed with green color using Rich
- [ ] Error messages displayed with red color using Rich
- [ ] Marking already completed task shows friendly message

---

## Example Usage

### Happy Path Example 1: Mark Pending Task Complete
```
Input:
  complete 5
  (Task 5 exists with title "Buy groceries", status=PENDING)

Output:
  ✓ Task 'Buy groceries' (ID: 5) marked as complete
```

### Happy Path Example 2: Mark Already Completed Task
```
Input:
  complete 3
  (Task 3 exists with status=COMPLETED)

Output:
  ✓ Task 'Call dentist' (ID: 3) is already complete
```

### Error Example 1: Non-existent Task
```
Input:
  complete 999
  (Task 999 does not exist)

Output:
  ✗ Error: Task with ID 999 not found
```

### Error Example 2: Invalid ID (String)
```
Input:
  complete abc

Output:
  ✗ Error: Invalid task ID. Please provide a valid number.
```

### Error Example 3: Zero or Negative ID
```
Input:
  complete 0

Output:
  ✗ Error: Task ID must be a positive number
```

---

## Test Cases

1. **Test: Mark pending task as complete changes status**
   - Given: Task with ID 5 exists with status=PENDING
   - When: mark_complete(5) is called
   - Then: Status is COMPLETED, updated_at is current time

2. **Test: Mark complete updates updated_at timestamp**
   - Given: Task with ID 3 exists
   - When: mark_complete(3) is called
   - Then: updated_at is set to current time

3. **Test: Mark complete does not change other fields**
   - Given: Task with ID 2 exists with title, description, created_at
   - When: mark_complete(2) is called
   - Then: Only status and updated_at change, other fields unchanged

4. **Test: Mark already completed task succeeds (idempotent)**
   - Given: Task with ID 4 exists with status=COMPLETED
   - When: mark_complete(4) is called
   - Then: Returns success, status remains COMPLETED

5. **Test: Mark complete on non-existent task returns error**
   - Given: Task with ID 999 does not exist
   - When: mark_complete(999) is called
   - Then: Error response with "not found" message

6. **Test: Mark complete with zero ID returns error**
   - Given: User provides ID 0
   - When: mark_complete(0) is called
   - Then: Error response with "positive number" message

7. **Test: Mark complete with negative ID returns error**
   - Given: User provides ID -5
   - When: mark_complete(-5) is called
   - Then: Error response with "positive number" message

8. **Test: Mark complete returns task in response**
   - Given: Task with ID 5 exists
   - When: mark_complete(5) is called
   - Then: Response includes updated task object

9. **Test: Mark complete returns success message with task details**
   - Given: Task with ID 7 exists with title "Finish report"
   - When: mark_complete(7) is called
   - Then: Success message includes task ID and title

10. **Test: Mark complete preserves created_at timestamp**
    - Given: Task with ID 6 exists with created_at = T1
    - When: mark_complete(6) is called
    - Then: created_at still equals T1, updated_at is later

---

## Implementation Notes

### Architecture Layer Mapping
- **Model** (models.py):
  - No changes needed (uses existing Task model)
- **Repository** (repository.py):
  - No additional methods needed (uses existing update and exists methods)
- **Service** (service.py):
  - Implement `mark_complete(task_id: int) -> dict` method
  - Internally calls update_task with status=COMPLETED
  - Returns formatted response with success/error
- **CLI** (cli.py):
  - Implement `mark_complete(task_id_str: str)` method
  - Parse task ID from user input
  - Handle type conversion (string → int)
  - Display success/error messages with Rich formatting

### Implementation Strategy
This feature is essentially a **convenience wrapper** around the Update Task feature:
```python
def mark_complete(task_id: int) -> dict:
    return self.update_task(task_id, status=TaskStatus.COMPLETED)
```

With additional logic for:
- Checking if already complete (friendly message)
- Custom success message mentioning "marked as complete"

### Dependencies
- **Update Task feature**: mark_complete delegates to update_task
- **Rich**: For colored terminal output
- **Type conversion**: Handle string → int conversion with error handling

### CLI Command Format
```
complete <id>       # Mark task as complete
```

### Future Compatibility
- **Phase 2 Enhancement**: May add batch complete (complete multiple tasks)
- **Phase 2 Enhancement**: May add "uncomplete" command to revert status
- **Phase 3 Migration**: Mark Complete becomes MCP tool for AI agent
- **Phase 3 Enhancement**: May add completion notifications or celebratory messages

---

## Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage >= 80% for mark_complete functionality
- [ ] Architect skill validation passed
- [ ] All 10 test cases passing
- [ ] Code follows PEP 8 and has type hints
- [ ] Integration with existing features works seamlessly

---

## Related Specifications

- [Update Task](./update-task.md) - Mark Complete delegates to Update Task
- [Add Task](./add-task.md) - Related CRUD operation
- [Delete Task](./delete-task.md) - Related CRUD operation
- [View Tasks](./view-tasks.md) - View completed tasks
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
- ✅ All pre-implementation checklist items pass
- ✅ Comprehensive test coverage (10 test cases)
- ✅ Excellent design choice: convenience wrapper around update_task
- ✅ Smart idempotent behavior (marking completed task succeeds)
- ✅ Proper delegation to existing update_task functionality
- ✅ Good user experience with friendly messages
- ✅ Minimal code duplication through delegation pattern
- ✅ Proper layered architecture mapping

**Approval Signature**: Architect Skill v1.0 (Dec 30, 2024)
