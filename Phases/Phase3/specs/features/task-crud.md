# Feature: Task CRUD Operations

## User Stories
- As a user, I can create a new task
- As a user, I can view all my tasks
- As a user, I can update a task
- As a user, I can delete a task
- As a user, I can mark a task complete
- As a user, I can filter tasks by status and priority
- As a user, I can search my tasks

## Acceptance Criteria

### Create Task
- Title is required (1-200 characters)
- Description is optional (max 1000 characters)
- Priority can be set (low, medium, high) - defaults to medium
- Due date is optional
- Task is associated with logged-in user

### View Tasks
- Only show tasks for current user
- Display title, status, priority, due date
- Support filtering by status (pending/completed)
- Support filtering by priority (high/medium/low)
- Support filtering by date (today/upcoming)
- Support text search on title and description

### Update Task
- Can update title, description, priority
- Can change status
- Validates same constraints as create

### Delete Task
- Confirmation required before delete
- Task is permanently removed

### Mark Complete
- Toggle task status to completed
- Show visual indicator (green checkmark, badge)

## Data Model

### Task
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | Primary key | Unique identifier |
| user_id | string (UUID) | Required | Owner's Better Auth user ID |
| title | string | Required, 1-200 chars | Task title |
| description | string | Optional, max 1000 chars | Task details |
| status | enum | "pending" \| "completed" | Current state |
| priority | enum | "low" \| "medium" \| "high" | Priority level |
| due_date | date | Optional | Due date |
| created_at | datetime | Auto-generated | Creation timestamp |
| updated_at | datetime | Auto-updated | Last modification |
