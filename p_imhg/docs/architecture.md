# Architecture Document
## ABC Polytechnic Digital Platform

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│   ┌─────────────────┐         ┌─────────────────────────┐  │
│   │  Web Browser    │         │  Mobile (iOS / Android)  │  │
│   │  Next.js 14     │         │  Expo React Native       │  │
│   │  (Vercel CDN)   │         │  (Expo EAS)              │  │
│   └────────┬────────┘         └────────────┬────────────┘  │
└────────────┼──────────────────────────────-┼────────────────┘
             │  HTTPS / WSS                  │  HTTPS / WSS
┌────────────▼───────────────────────────────▼────────────────┐
│                    SUPABASE PLATFORM                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Auth        │  │  PostgREST   │  │  Realtime        │  │
│  │  (JWT/OAuth) │  │  REST API    │  │  (WebSockets)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             PostgreSQL Database                      │   │
│  │  users │ courses │ results │ announcements           │   │
│  │  notifications │ chatbot_logs │ roles                │   │
│  │  + RLS Policies on all tables                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────┐
│      OPENAI API             │
│  GPT-3.5-turbo              │
│  (Chatbot — server-side)    │
└─────────────────────────────┘
```

---

## 2. Web App Architecture (Next.js 14)

```
src/
├── app/                    ← App Router
│   ├── (auth)/login/       ← Public route
│   ├── auth/callback/      ← OAuth callback
│   ├── student/            ← Protected (role=2)
│   │   ├── layout.tsx      ← Auth + role guard
│   │   ├── profile/
│   │   ├── results/
│   │   ├── announcements/
│   │   ├── notifications/
│   │   └── chatbot/
│   ├── admin/              ← Protected (role=1)
│   │   ├── layout.tsx      ← Auth + admin guard
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── results/
│   │   ├── announcements/
│   │   └── notifications/
│   └── api/
│       └── chatbot/        ← POST /api/chatbot
├── components/
│   ├── layout/             ← Sidebar, PageHeader
│   └── ui/                 ← Badge, StatCard
├── lib/
│   ├── supabase/           ← client, server, admin
│   └── utils.ts
├── middleware.ts            ← Route guard (all routes)
└── types/database.types.ts ← Full TypeScript types
```

### Data Flow: Student Views Results
```
Browser → GET /student/results
  → middleware.ts: verify session + role
  → app/student/results/page.tsx (Server Component)
    → createClient() (server)
    → supabase.from('results').select(...)  [RLS: student_id = auth.uid()]
    → render HTML with real data
  → Client receives pre-rendered page
```

### Data Flow: Chatbot
```
Client → POST /api/chatbot { message }
  → Zod validation
  → OpenAI API (server-side, controlled system prompt)
  → Log to chatbot_logs table
  → Return { reply }
```

---

## 3. Mobile App Architecture (Expo)

```
src/
├── app/                    ← Expo Router
│   ├── _layout.tsx         ← Root layout + auth check
│   ├── (auth)/login.tsx
│   └── (student)/
│       ├── _layout.tsx     ← Tab navigation
│       ├── profile.tsx
│       ├── results.tsx
│       ├── announcements.tsx
│       ├── notifications.tsx
│       └── chatbot.tsx
├── components/
│   ├── ui/                 ← ThemedButton, Card
│   └── chatbot/
└── lib/
    └── supabase.ts         ← Expo Supabase client (AsyncStorage)
```

---

## 4. Security Architecture

| Layer | Mechanism |
|---|---|
| Transport | HTTPS/TLS enforced by Vercel + Supabase |
| Auth | Supabase Auth JWT (httpOnly cookies on web) |
| Authorization | Next.js middleware + Supabase RLS policies |
| Data Isolation | RLS: students can only read their own data |
| API Protection | Server-side API routes, Zod input validation |
| Secret Management | `.env.local` (never committed), service key only on server |

---

## 5. Hosting & Deployment

| Service | Provider | Notes |
|---|---|---|
| Web App | Vercel | Auto-deploy from GitHub, serverless |
| Database + Auth | Supabase | Managed PostgreSQL |
| Mobile App | Expo EAS | OTA updates, native builds |
| AI API | OpenAI | GPT-3.5-turbo, server-side only |
