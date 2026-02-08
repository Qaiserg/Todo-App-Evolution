# Todo App - Phase 3 (AI-Powered)

An AI-powered todo application with natural language task management, reminders, voice commands, and multi-language support.

## Features

- **AI Chat Assistant** — Manage tasks through natural conversation (add, update, complete, delete)
- **Smart Reminders** — Set alarms via voice or text ("remind me in 1 hour", "alarm at 5 PM")
- **Voice Commands** — Speak to the AI assistant using your microphone
- **Multi-language** — Supports English and Urdu
- **PWA Support** — Installable as a mobile/desktop app with offline caching
- **Authentication** — Secure sign-up/sign-in with Better Auth
- **Task Management** — CRUD with priorities, due dates, and status tracking
- **Real-time Notifications** — Browser notifications when reminders trigger

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Chat UI | OpenAI ChatKit |
| Authentication | Better Auth |
| Backend | Python FastAPI |
| AI Agent | OpenAI Agents SDK |
| Database | Neon Serverless PostgreSQL |
| Styling | Tailwind CSS |
| PWA | next-pwa |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```
DATABASE_URL=<neon-postgresql-url>
BETTER_AUTH_SECRET=<your-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=<openai-domain-key>
```

## Deployment

Deployed on Vercel. The backend is deployed on Render.

- Frontend: https://todo-app-evolution-phase3.vercel.app
- Backend: https://todo-phase3-backend.onrender.com
