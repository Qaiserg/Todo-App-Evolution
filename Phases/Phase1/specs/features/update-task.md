# Feature: Update Task

---

## Context
Users need the ability to modify existing tasks to correct mistakes, refine details, or update the task status. This is a core Phase 1 Basic Level feature that enables proper task lifecycle management. Users can update a task's title, description, and status while maintaining data integrity through validation.

---

## User Stories

- As a user, I want to update a task's title by its ID, so that I can correct typos or refine task names
- As a user, I want to update a task's description by its ID, so that I can add or modify additional context
- As a user, I want to update a task's status by its ID, so that I can manually mark tasks as pending or completed
- As a user, I want to see a confirmation when a task is updated, so that I know the operation succeeded
- As a user, I want to see which fields were changed in the confirmation, so that I can verify the update
- As a user, I want to see a clear error if I try to update a non-existent task, so that I understand what went wrong
- As a user, I want validation on updated fields, so that I can't enter invalid data
- As a user, I want the updated_at timestamp to automatically update, so that I can track when tasks were last modified

---

## Data Schema

### Task Model (Reference)
```
Task {
  id: int (unique, immutable) - Used to identify which task to update
  title: str (updateable) - Can be modified (1-200 chars)
  description: str | None (updateable) - Can be modified (max 1000 chars)
  status: TaskStatus (updateable) - Can be changed (PENDING | COMPLETED)
  created_at: datetime (immutable) - Never changes after creation
  updated_at: datetime (auto-updated) - Automatically set to current time on update
}
```

**Update Behavior**:
- Only provided fields are updated (partial updates supported)
- Validation rules same as Add Task (title 1-200, description max 1000)
- updated_at automatically set to current datetime
- created_at remains unchanged

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can update a task's title by providing task ID and new title
- [ ] User can update a task's description by providing task ID and new description
- [ ] User can update a task's status by providing task ID and new status
- [ ] User can update multiple fields in a single operation
- [ ] User can update only specific fields (partial update)
- [ ] updated_at timestamp is automatically set to current time on any update
- [ ] created_at timestamp never changes during updates
- [ ] Task ID cannot be changed (immutable)

### Validation Rules
- [ ] Task ID must be a valid integer
- [ ] Task ID must exist in the repository
- [ ] Task ID must be greater than 0
- [ ] If updating title: must be 1-200 characters
- [ ] If updating description: must be max 1000 characters (None is valid)
- [ ] If updating status: must be valid TaskStatus (PENDING or COMPLETED)
- [ ] At least one field must be provided for update

### Error Handling
- [ ] Show error "Task with ID {id} not found" if task doesn't exist
- [ ] Show error "Invalid task ID" if ID is not a valid integer
- [ ] Show error "Task ID must be a positive number" if ID is 0 or negative
- [ ] Show error "No fields provided for update" if no update fields given
- [ ] Show validation errors for invalid title, description, or status values
- [ ] Handle gracefully when updating in empty repository

### User Experience
- [ ] Success message shows: "Task {id} updated successfully"
- [ ] Success message lists which fields were changed
- [ ] Success messages displayed with green color using Rich
- [ ] Error messages displayed with red color using Rich
- [ ] Display updated task details after successful update

---

## Example Usage

### Happy Path Example 1: Update Title Only
```
Input:
  task_id = 5
  title = "Buy organic groceries"
  (Task 5 exists with title "Buy groceries")

Output:
  ✓ Task 5 updated successfully
  Updated fields: title

  ID:          5
  Title:       Buy organic groceries
  Description: (previous description unchanged)
  Status:      Pending
  Created:     2024-12-30 10:00:00
  Updated:     2024-12-30 14:30:00
```

### Happy Path Example 2: Update Multiple Fields
```
Input:
  task_id = 3
  title = "Complete project report"
  description = "Include charts and executive summary"
  status = COMPLETED

Output:
  ✓ Task 3 updated successfully
  Updated fields: title, description, status

  [Task details displayed]
```

### Happy Path Example 3: Update Description to None (Clear)
```
Input:
  task_id = 7
  description = None

Output:
  ✓ Task 7 updated successfully
  Updated fields: description

  [Task details with description cleared]
```

### Happy Path Example 4: Update Status Only
```
Input:
  task_id = 2
  status = COMPLETED

Output:
  ✓ Task 2 updated successfully
  Updated fields: status

  [Task details with status changed to Completed]
```

### Error Example 1: Non-existent Task
```
Input:
  task_id = 999
  title = "New title"

Output:
  ✗ Error: Task with ID 999 not found
```

### Error Example 2: Invalid Title (Too Long)
```
Input:
  task_id = 5
  title = "a" * 201

Output:
  ✗ Error: Title must not exceed 200 characters
```

### Error Example 3: Invalid Task ID
```
Input:
  task_id = "abc"
  title = "New title"

Output:
  ✗ Error: Invalid task ID. Please provide a valid number.
```

### Error Example 4: No Fields Provided
```
Input:
  task_id = 5
  (no update fields provided)

Output:
  ✗ Error: No fields provided for update
```

---

## Test Cases

1. **Test: Update task title changes title and updates timestamp**
   - Given: Task with ID 5 exists with title "Old title"
   - When: update_task(5, title="New title") is called
   - Then: Title is changed, updated_at is current time, created_at unchanged

2. **Test: Update task description changes description**
   - Given: Task with ID 3 exists
   - When: update_task(3, description="New description") is called
   - Then: Description is updated, other fields unchanged except updated_at

3. **Test: Update task status changes status**
   - Given: Task with ID 2 exists with status PENDING
   - When: update_task(2, status=COMPLETED) is called
   - Then: Status is COMPLETED, other fields unchanged except updated_at

4. **Test: Update multiple fields changes all provided fields**
   - Given: Task with ID 4 exists
   - When: update_task(4, title="New", description="Desc", status=COMPLETED) is called
   - Then: All three fields updated, updated_at changed, created_at unchanged

5. **Test: Update description to None clears description**
   - Given: Task with ID 6 exists with description "Old desc"
   - When: update_task(6, description=None) is called
   - Then: Description is None, other fields unchanged except updated_at

6. **Test: Update non-existent task returns error**
   - Given: Task with ID 999 does not exist
   - When: update_task(999, title="New") is called
   - Then: Error response with "not found" message

7. **Test: Update with invalid title returns error**
   - Given: Task with ID 5 exists
   - When: update_task(5, title="") is called (empty title)
   - Then: Error response with validation message

8. **Test: Update with title exceeding 200 chars returns error**
   - Given: Task with ID 5 exists
   - When: update_task(5, title="a" * 201) is called
   - Then: Error response with "200 characters" message

9. **Test: Update with description exceeding 1000 chars returns error**
   - Given: Task with ID 5 exists
   - When: update_task(5, description="a" * 1001) is called
   - Then: Error response with "1000 characters" message

10. **Test: Update with zero ID returns error**
    - Given: User provides ID 0
    - When: update_task(0, title="New") is called
    - Then: Error response with "positive number" message

11. **Test: Update with negative ID returns error**
    - Given: User provides ID -5
    - When: update_task(-5, title="New") is called
    - Then: Error response with "positive number" message

12. **Test: Update created_at remains unchanged**
    - Given: Task with ID 5 exists with created_at = T1
    - When: update_task(5, title="New") is called
    - Then: created_at still equals T1, updated_at is later than T1

13. **Test: Update with no fields returns error**
    - Given: Task with ID 5 exists
    - When: update_task(5) is called with no update fields
    - Then: Error response with "no fields provided" message

14. **Test: Update with max length title succeeds**
    - Given: Task with ID 5 exists
    - When: update_task(5, title="a" * 200) is called
    - Then: Update succeeds, title is 200 characters

15. **Test: Update with max length description succeeds**
    - Given: Task with ID 5 exists
    - When: update_task(5, description="a" * 1000) is called
    - Then: Update succeeds, description is 1000 characters

---

## Implementation Notes

### Architecture Layer Mapping
- **Model** (models.py):
  - No changes needed (uses existing Task model)
  - Pydantic validation automatically applies to updated fields
- **Repository** (repository.py):
  - Already has `update(task: Task) -> Task | None` method
  - Already has `exists(task_id: int) -> bool` method
  - Already has `read(task_id: int) -> Task | None` method
- **Service** (service.py):
  - Implement `update_task(task_id: int, title: str | None = None, description: str | None = None, status: TaskStatus | None = None) -> dict` method
  - Validate task_id is positive integer
  - Check if task exists before updating
  - Retrieve current task from repository
  - Apply updates to only provided fields
  - Set updated_at to current datetime
  - Return formatted response with success/error
- **CLI** (cli.py):
  - Implement `update` command
  - Parse task ID and update fields from user input
  - Handle type conversion (string → int for ID, string → TaskStatus for status)
  - Display success/error messages with Rich formatting
  - Display updated task details after successful update

### Dependencies
- **Repository methods**: `update()`, `exists()`, `read()`
- **Rich**: For colored terminal output
- **datetime**: For setting updated_at timestamp
- **Type conversion**: Handle string → int, string → TaskStatus conversion with error handling
- **Pydantic validation**: Automatic validation when creating updated Task object

### CLI Command Format
```
update <id> [--title "New title"] [--description "New desc"] [--status pending|completed]
```

### Future Compatibility
- **Phase 2 Migration**: Will use SQLModel UPDATE query instead of dict update
- **Phase 2 Enhancement**: May add field-level change tracking/audit log
- **Phase 3 Migration**: Update Task becomes MCP tool for AI agent
- **Phase 3 Enhancement**: May add optimistic locking for concurrent updates

---

## Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage >= 80% for update_task functionality
- [ ] Architect skill validation passed
- [ ] All 15 test cases passing
- [ ] Code follows PEP 8 and has type hints
- [ ] Integration with existing add_task and delete_task works seamlessly

---

## Related Specifications

- [Add Task](./add-task.md) - Related CRUD operation
- [Delete Task](./delete-task.md) - Related CRUD operation
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

**Status**: ✅ APPROVED WITH NOTES

**Review Date**: December 30, 2024

**Feedback**:
- ✅ All pre-implementation checklist items pass
- ✅ Comprehensive test coverage (15 test cases)
- ✅ Excellent handling of partial updates (update only provided fields)
- ✅ Proper timestamp management (updated_at auto-updates, created_at immutable)
- ✅ Validation rules consistent with Add Task feature
- ✅ Clear error handling for all edge cases
- ✅ Proper layered architecture mapping

**Implementation Note**:
The CLI command format should use simple space-separated parsing consistent with existing commands (add, delete), not flag-based parsing. Recommended format:
```
update <id> <field> <value>
```
where field is: title, description, status

For updating multiple fields, users can run multiple update commands. This maintains CLI simplicity for Phase 1 (advanced parsing can be added in Phase 3).

**Approval Signature**: Architect Skill v1.0 (Dec 30, 2024)
