# REST API Endpoints

## Base URL
- Development: http://localhost:8000
- Production: https://api.example.com

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### GET /api/{user_id}/tasks
List all tasks for authenticated user.

**Query Parameters:**
- `status_filter`: "pending" | "completed" (optional)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": "uuid-string",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-01-15",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

**Errors:**
- 401: Missing or invalid token
- 403: User ID mismatch

---

### POST /api/{user_id}/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "medium",
  "due_date": "2025-01-15"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": "uuid-string",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "priority": "medium",
  "due_date": "2025-01-15",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**
- 400: Validation error (title required, max lengths)
- 401: Missing or invalid token
- 403: User ID mismatch

---

### GET /api/{user_id}/tasks/{id}
Get a specific task by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": "uuid-string",
  "title": "Buy groceries",
  ...
}
```

**Errors:**
- 401: Missing or invalid token
- 403: User ID mismatch
- 404: Task not found

---

### PUT /api/{user_id}/tasks/{id}
Update a task.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": "uuid-string",
  "title": "Updated title",
  ...
}
```

**Errors:**
- 400: Validation error
- 401: Missing or invalid token
- 403: User ID mismatch
- 404: Task not found

---

### DELETE /api/{user_id}/tasks/{id}
Delete a task.

**Response (204 No Content)**

**Errors:**
- 401: Missing or invalid token
- 403: User ID mismatch
- 404: Task not found

---

### PATCH /api/{user_id}/tasks/{id}/complete
Mark a task as complete.

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "completed",
  ...
}
```

**Errors:**
- 401: Missing or invalid token
- 403: User ID mismatch
- 404: Task not found
