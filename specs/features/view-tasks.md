# Feature: View Tasks

---

## Context
Users need the ability to view their tasks to understand what work needs to be done, track progress, and manage their todo list effectively. This is a core Phase 1 Basic Level feature that provides visibility into the task repository. Users can view all tasks or filter by status (pending/completed) to focus on specific subsets.

---

## User Stories

- As a user, I want to view all my tasks, so that I can see my complete todo list
- As a user, I want to view only pending tasks, so that I can focus on work that needs to be done
- As a user, I want to view only completed tasks, so that I can see what I've accomplished
- As a user, I want tasks displayed in a formatted table, so that information is easy to read
- As a user, I want to see task details (ID, title, description, status, timestamps), so that I have complete information
- As a user, I want to see a clear message when no tasks exist, so that I know the list is empty
- As a user, I want to see a count of tasks, so that I know how many items are in the list

---

## Data Schema

### Task Model (Reference)
```
Task {
  id: int - Displayed in table
  title: str - Displayed in table
  description: str | None - Displayed in table (or "—" if None)
  status: TaskStatus - Displayed in table (PENDING | COMPLETED)
  created_at: datetime - Displayed in table (formatted)
  updated_at: datetime - Displayed in table (formatted)
}
```

**Display Behavior**:
- Tasks sorted by ID (ascending) by default
- Empty descriptions shown as "—" or "(no description)"
- Timestamps formatted as "YYYY-MM-DD HH:MM:SS"
- Status shown as "Pending" or "Completed"

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can view all tasks regardless of status
- [ ] User can filter tasks by status (pending only)
- [ ] User can filter tasks by status (completed only)
- [ ] Tasks are displayed in a formatted table with Rich
- [ ] Table shows: ID, Title, Description, Status, Created, Updated
- [ ] Tasks are sorted by ID in ascending order
- [ ] Task count is displayed (e.g., "Showing 5 tasks")

### Data Handling
- [ ] Empty task list shows friendly message (e.g., "No tasks found")
- [ ] None descriptions displayed as "—" or "(no description)"
- [ ] Timestamps formatted for readability (not ISO format)
- [ ] Long titles truncated if needed for table formatting
- [ ] Long descriptions truncated if needed for table formatting

### User Experience
- [ ] Table has clear column headers
- [ ] Table uses Rich formatting for visual appeal
- [ ] Different colors for pending vs completed status
- [ ] Empty list message is friendly and helpful
- [ ] Command variations supported: "view", "view all", "view pending", "view completed"

---

## Example Usage

### Happy Path Example 1: View All Tasks
```
Input:
  view
  (Repository has 3 tasks: 1 pending, 2 completed)

Output:
  Showing 3 tasks

  ┌────┬─────────────────┬──────────────┬───────────┬─────────────────────┬─────────────────────┐
  │ ID │ Title           │ Description  │ Status    │ Created             │ Updated             │
  ├────┼─────────────────┼──────────────┼───────────┼─────────────────────┼─────────────────────┤
  │ 1  │ Buy groceries   │ Milk, eggs   │ Pending   │ 2024-12-30 10:00:00 │ 2024-12-30 10:00:00 │
  │ 2  │ Call dentist    │ —            │ Completed │ 2024-12-30 11:00:00 │ 2024-12-30 14:00:00 │
  │ 3  │ Finish report   │ Include...   │ Completed │ 2024-12-30 12:00:00 │ 2024-12-30 15:00:00 │
  └────┴─────────────────┴──────────────┴───────────┴─────────────────────┴─────────────────────┘
```

### Happy Path Example 2: View Pending Tasks Only
```
Input:
  view pending
  (Repository has 2 pending tasks out of 5 total)

Output:
  Showing 2 pending tasks

  ┌────┬─────────────────┬──────────────┬─────────┬─────────────────────┬─────────────────────┐
  │ ID │ Title           │ Description  │ Status  │ Created             │ Updated             │
  ├────┼─────────────────┼──────────────┼─────────┼─────────────────────┼─────────────────────┤
  │ 1  │ Buy groceries   │ Milk, eggs   │ Pending │ 2024-12-30 10:00:00 │ 2024-12-30 10:00:00 │
  │ 3  │ Write code      │ Feature #3   │ Pending │ 2024-12-30 12:00:00 │ 2024-12-30 12:00:00 │
  └────┴─────────────────┴──────────────┴─────────┴─────────────────────┴─────────────────────┘
```

### Happy Path Example 3: View Completed Tasks Only
```
Input:
  view completed
  (Repository has 3 completed tasks out of 5 total)

Output:
  Showing 3 completed tasks

  [Table with 3 completed tasks]
```

### Edge Case Example 1: Empty Repository
```
Input:
  view
  (Repository is empty)

Output:
  No tasks found. Add your first task with 'add <title>'.
```

### Edge Case Example 2: No Pending Tasks
```
Input:
  view pending
  (All tasks are completed)

Output:
  No pending tasks found. Great job!
```

### Edge Case Example 3: No Completed Tasks
```
Input:
  view completed
  (All tasks are pending)

Output:
  No completed tasks found. Keep working!
```

---

## Test Cases

1. **Test: View all tasks returns all tasks from repository**
   - Given: Repository has 5 tasks (3 pending, 2 completed)
   - When: view_tasks() is called with no filter
   - Then: Returns all 5 tasks sorted by ID

2. **Test: View pending tasks returns only pending tasks**
   - Given: Repository has 5 tasks (3 pending, 2 completed)
   - When: view_tasks(status=PENDING) is called
   - Then: Returns 3 pending tasks only

3. **Test: View completed tasks returns only completed tasks**
   - Given: Repository has 5 tasks (3 pending, 2 completed)
   - When: view_tasks(status=COMPLETED) is called
   - Then: Returns 2 completed tasks only

4. **Test: View tasks on empty repository returns empty list**
   - Given: Repository is empty
   - When: view_tasks() is called
   - Then: Returns empty list

5. **Test: View pending tasks when none exist returns empty list**
   - Given: Repository has only completed tasks
   - When: view_tasks(status=PENDING) is called
   - Then: Returns empty list

6. **Test: View completed tasks when none exist returns empty list**
   - Given: Repository has only pending tasks
   - When: view_tasks(status=COMPLETED) is called
   - Then: Returns empty list

7. **Test: Tasks are sorted by ID in ascending order**
   - Given: Repository has tasks with IDs: 5, 1, 3, 2, 4
   - When: view_tasks() is called
   - Then: Returns tasks in order: 1, 2, 3, 4, 5

8. **Test: View tasks includes all task fields**
   - Given: Repository has tasks with all fields populated
   - When: view_tasks() is called
   - Then: Each task has id, title, description, status, created_at, updated_at

9. **Test: View tasks handles None descriptions**
   - Given: Repository has tasks with description=None
   - When: view_tasks() is called
   - Then: Tasks with None descriptions are included in results

10. **Test: View returns success response with task list**
    - Given: Repository has tasks
    - When: view_tasks() is called
    - Then: Returns dict with success=True and tasks list

---

## Implementation Notes

### Architecture Layer Mapping
- **Model** (models.py):
  - No changes needed (uses existing Task model)
- **Repository** (repository.py):
  - Already has `read_all() -> list[Task]` method
  - No additional methods needed
- **Service** (service.py):
  - Implement `view_tasks(status: TaskStatus | None = None) -> dict` method
  - If status is None, return all tasks
  - If status is provided, filter by that status
  - Sort tasks by ID (ascending)
  - Return formatted response with task list
- **CLI** (cli.py):
  - Implement `view_tasks(status_filter: str | None = None)` method
  - Create Rich Table with columns: ID, Title, Description, Status, Created, Updated
  - Handle empty list with friendly message
  - Display task count
  - Format timestamps for readability
  - Show "—" for None descriptions

### Dependencies
- **Repository methods**: `read_all()`
- **Rich**: For Table display with borders, colors, and formatting
- **datetime**: For timestamp formatting
- **Type conversion**: Handle string → TaskStatus conversion for CLI

### CLI Command Format
```
view                  # View all tasks
view all              # View all tasks (explicit)
view pending          # View pending tasks only
view completed        # View completed tasks only
```

### Future Compatibility
- **Phase 2 Migration**: Will use SQLModel SELECT query instead of dict read_all()
- **Phase 2 Enhancement**: Add sorting options (by date, title, status)
- **Phase 2 Enhancement**: Add pagination for large task lists
- **Phase 3 Migration**: View Tasks becomes MCP tool for AI agent
- **Phase 3 Enhancement**: Add search/filter by title or description

---

## Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage >= 80% for view_tasks functionality
- [ ] Architect skill validation passed
- [ ] All 10 test cases passing
- [ ] Code follows PEP 8 and has type hints
- [ ] Integration with existing features works seamlessly
- [ ] Rich table displays correctly in terminal

---

## Related Specifications

- [Add Task](./add-task.md) - Related CRUD operation
- [Delete Task](./delete-task.md) - Related CRUD operation
- [Update Task](./update-task.md) - Related CRUD operation
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
- ✅ Excellent user experience design with Rich tables
- ✅ Proper handling of empty states with friendly messages
- ✅ Good filtering support (all, pending, completed)
- ✅ Leverages existing repository read_all() method efficiently
- ✅ Clear sorting specification (by ID ascending)
- ✅ Proper layered architecture mapping
- ✅ Handles edge cases well (empty list, no matches for filter)

**Approval Signature**: Architect Skill v1.0 (Dec 30, 2024)
