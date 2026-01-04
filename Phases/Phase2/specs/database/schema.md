# Database Schema

## Database
- **Provider**: Neon Serverless PostgreSQL
- **ORM**: SQLModel (Python)

## Tables

### Task Table
Stores user tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| user_id | VARCHAR(255) | NOT NULL | Better Auth user UUID |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | VARCHAR(1000) | NULL | Task details |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | "pending" or "completed" |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' | "low", "medium", or "high" |
| due_date | DATE | NULL | Optional due date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Better Auth Tables
Managed by Better Auth library. Created automatically.

#### user
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | UUID primary key |
| name | VARCHAR(255) | User's display name |
| email | VARCHAR(255) | User's email (unique) |
| emailVerified | BOOLEAN | Email verification status |
| image | TEXT | Profile image URL |
| createdAt | TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | Last update time |

#### session
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Session ID |
| userId | VARCHAR(255) | Reference to user |
| token | TEXT | Session token |
| expiresAt | TIMESTAMP | Session expiration |
| ipAddress | VARCHAR(255) | Client IP |
| userAgent | TEXT | Browser user agent |
| createdAt | TIMESTAMP | Session creation time |
| updatedAt | TIMESTAMP | Last update time |

#### account
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Account ID |
| userId | VARCHAR(255) | Reference to user |
| accountId | VARCHAR(255) | Provider account ID |
| providerId | VARCHAR(255) | Auth provider |
| password | TEXT | Hashed password |
| createdAt | TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | Last update time |

## Indexes
- `task.user_id` - For filtering tasks by user
- `user.email` - Unique index for email lookup
- `session.token` - For session validation

## SQL Migrations

### Create Task Table
```sql
CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
```
