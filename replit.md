# Cortical AI — Workspace

## Overview

Full-stack pnpm monorepo — Cortical AI chatbot (Polish AI company). Features Prime Lite and Prime Max models, Supabase Auth (email OTP), chat history, dark/light mode, geometric animations, and inactivity background bubbles.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/cortical)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth (email OTP magic link)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS v4

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/          # Express API server (port 8080, path /api)
│   └── cortical/            # React + Vite frontend (path /)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/                  # Drizzle ORM schema + DB connection
└── scripts/                 # Utility scripts
```

## Key Features

- **Authentication**: Supabase Auth email OTP (6-digit code), Guest mode
- **Models**: Prime Lite (geometric morph animation) and Prime Max (progress bar + cycling text)
- **Chat**: POST to n8n webhook https://natekkz-n8n-free.hf.space/webhook/cortical-api
- **Sidebar**: Chat history grouped by date (Today/Yesterday/Last 7 days)
- **Dark mode**: Default dark, toggle to light
- **Background bubble**: Animated noise bubble during inactivity (3s timeout)
- **"Dostosuj Prime"**: Custom system prompt per chat

## Database Schema

- `chats` table: id, userId, title, model, systemPrompt, createdAt, updatedAt
- `messages` table: id, chatId, role, content, createdAt

## API Routes (all at /api/)

- `GET /api/healthz` — health check
- `GET /api/chats?userId=X` — list user's chats
- `POST /api/chats` — create chat
- `DELETE /api/chats/:chatId` — delete chat + messages
- `GET /api/chats/:chatId/messages` — get messages
- `POST /api/chats/:chatId/messages` — save message
- `GET /api/config` — returns Supabase URL/key for frontend

## Environment Variables

- `SUPABASE_URL` — Supabase project URL (in Replit Secrets)
- `SUPABASE_ANON_KEY` — Supabase anon key (in Replit Secrets)
- `DATABASE_URL` — PostgreSQL connection (auto-provisioned)

## Frontend Env Setup

Frontend uses `setup-env.js` to generate `.env.local` from Replit secrets before Vite starts. This auto-detects and corrects swapped SUPABASE_URL/SUPABASE_ANON_KEY values.
