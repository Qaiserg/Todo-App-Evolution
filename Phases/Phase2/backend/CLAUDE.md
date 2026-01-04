# Backend Guidelines

## Stack
- FastAPI
- SQLModel (ORM)
- Neon PostgreSQL
- python-jose (JWT verification)

## Project Structure
```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── auth.py              # JWT verification middleware
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel
│   └── api/
│       ├── __init__.py
│       └── tasks.py         # Task API routes
├── .env                     # Environment variables
├── requirements.txt
└── CLAUDE.md
```

## API Conventions
- All routes under `/api/{user_id}/`
- Return JSON responses
- Use Pydantic models for request/response
- Handle errors with HTTPException
- All endpoints require valid JWT token

## JWT Authentication
```python
# auth.py - Verify JWT tokens from Better Auth
from jose import jwt

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

def verify_user_token(user_id: str, credentials) -> str:
    """Verify JWT and ensure user_id matches token."""
    token = credentials.credentials
    payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
    token_user_id = payload.get("sub")

    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    return token_user_id
```

## API Endpoints
```
GET    /api/{user_id}/tasks              - List user's tasks
POST   /api/{user_id}/tasks              - Create task
GET    /api/{user_id}/tasks/{id}         - Get single task
PUT    /api/{user_id}/tasks/{id}         - Update task
DELETE /api/{user_id}/tasks/{id}         - Delete task
PATCH  /api/{user_id}/tasks/{id}/complete - Mark complete
```

## Route Pattern with Auth
```python
# api/tasks.py
from fastapi import APIRouter, Depends
from ..auth import verify_user_token, security

router = APIRouter()

@router.get("/api/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    verified_user: str = Depends(verify_user_token),
    session: Session = Depends(get_session),
):
    # verified_user ensures JWT is valid and matches user_id
    tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()
    return tasks
```

## Database
- Use SQLModel for all database operations
- Connection string from environment: DATABASE_URL
- Task model includes user_id (string UUID from Better Auth)

## Environment Variables (.env)
```
DATABASE_URL=<neon-postgresql-url>
BETTER_AUTH_SECRET=<shared-secret>
```

## Running
```bash
cd backend
.venv\Scripts\activate  # Windows
uvicorn src.main:app --reload --port 8000
```

## CORS
Configured to allow frontend at http://localhost:3000
