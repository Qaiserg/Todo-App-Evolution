# Feature: Authentication with Better Auth

## Overview
User authentication using Better Auth library with JWT tokens for API authorization.

## User Stories
- As a visitor, I can create a new account
- As a user, I can sign in with email and password
- As a user, I can sign out
- As a user, my session persists across page refreshes
- As a user, my tasks are private and isolated from other users

## Technology Stack
- **Frontend**: Better Auth client library
- **Backend**: JWT token verification
- **Database**: Better Auth managed tables (user, session, account)

## Authentication Flow

### Registration
1. User enters email, name, password on signup form
2. Better Auth creates user in database
3. Session is created automatically
4. JWT token is issued for API calls
5. User is redirected to main app

### Login
1. User enters email and password
2. Better Auth validates credentials
3. Session is created
4. JWT token is issued for API calls
5. User is redirected to main app

### Logout
1. User clicks sign out
2. Session is destroyed
3. JWT token is invalidated
4. User is redirected to welcome page

### API Authorization
1. Frontend gets JWT token from Better Auth
2. JWT token is included in Authorization header
3. Backend verifies JWT signature using shared secret
4. Backend extracts user_id from token
5. Backend verifies user_id in URL matches token
6. Request is processed or rejected

## Security Requirements

### JWT Configuration
- Algorithm: HS256
- Expiration: 7 days
- Shared secret: BETTER_AUTH_SECRET environment variable

### User Isolation
- All API endpoints require valid JWT
- User can only access their own tasks
- User ID in URL must match token's user ID

### Session Management
- Sessions expire after 7 days
- Sessions update every 24 hours
- Logout invalidates session

## Environment Variables

### Frontend (.env.local)
```
DATABASE_URL=<neon-postgresql-connection-string>
BETTER_AUTH_SECRET=<shared-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=<neon-postgresql-connection-string>
BETTER_AUTH_SECRET=<shared-secret>
```
