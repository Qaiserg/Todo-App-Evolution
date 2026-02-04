# Frontend Guidelines

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (authentication)

## Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Toaster
│   │   ├── page.tsx            # Main app (task dashboard)
│   │   ├── welcome/page.tsx    # Landing page
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   └── api/auth/           # Better Auth API routes
│   │       ├── [...all]/route.ts
│   │       └── token/route.ts  # JWT token endpoint
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── TaskCard.tsx        # Task display card
│   │   ├── TaskModal.tsx       # Add/edit task modal
│   │   └── EmptyState.tsx      # Empty state display
│   └── lib/
│       ├── api.ts              # API client with auth
│       ├── auth.ts             # Better Auth server config
│       ├── auth-client.ts      # Better Auth client
│       ├── auth-context.tsx    # Auth React context
│       └── types.ts            # TypeScript types
├── .env.local                  # Environment variables
└── CLAUDE.md
```

## Patterns
- Use server components by default
- Client components only when needed (interactivity)
- API calls go through `/lib/api.ts`
- Auth state managed via `/lib/auth-context.tsx`

## Authentication (Better Auth)
```typescript
// lib/auth-client.ts - Client-side auth
import { createAuthClient } from "better-auth/react";
export const { signIn, signUp, signOut, useSession } = createAuthClient({...});

// lib/auth-context.tsx - Provides user state
const { user, loading, login, signup, logout } = useAuth();
```

## API Client with JWT
```typescript
// lib/api.ts - All API calls include JWT token
async function getAuthHeaders(): Promise<HeadersInit> {
  const tokenResponse = await fetch('/api/auth/token');
  const { token } = await tokenResponse.json();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// API calls use user_id in URL
const response = await fetch(`${API_BASE}/api/${userId}/tasks`, {
  headers: await getAuthHeaders(),
});
```

## Environment Variables (.env.local)
```
DATABASE_URL=<neon-postgresql-url>
BETTER_AUTH_SECRET=<shared-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running
```bash
cd frontend
npm install
npm run dev
```
Opens at http://localhost:3000

## Styling
- Use Tailwind CSS classes
- No inline styles
- Follow existing component patterns
- Mobile-first responsive design
