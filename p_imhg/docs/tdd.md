# Technical Design Document (TDD)
## ABC Polytechnic Digital Platform — v1.0

---

## 1. Technology Decisions

### 1.1 Next.js 14 App Router
- **Why:** Server Components reduce client bundle, middleware enables server-side route guards, streaming SSR improves TTFB
- **Key patterns used:**
  - Layouts for shared UI (Sidebar) per role group
  - Server Components for all data-fetching pages
  - Client Components only where interactivity is needed (forms, chatbot, realtime)

### 1.2 Supabase
- **Why:** Managed PostgreSQL + Auth + Realtime in one service, eliminates backend boilerplate
- **Client strategy:**
  - `@supabase/ssr` `createBrowserClient` — browser (Client Components)
  - `@supabase/ssr` `createServerClient` with `cookies()` — RSC & API routes
  - `createClient` with `service_role` key — admin API routes only (bypasses RLS)

### 1.3 Row Level Security
- RLS enforced at the **database layer** — even if application code is compromised, data isolation holds
- `is_admin()` helper function using `SECURITY DEFINER` avoids infinite recursion in policy checks

### 1.4 OpenAI GPT-3.5-turbo for Chatbot
- **Why:** Widely available, cost-effective, good instruction-following
- System prompt hard-codes college-only scope
- All calls are **server-side only** — API key never exposed to client
- Logs stored in `chatbot_logs` for audit trail and future RAG integration

---

## 2. Database Design Decisions

### 2.1 Grade Auto-Computation
Grade is computed by a PostgreSQL trigger (`compute_grade`) on INSERT/UPDATE of results. This ensures consistent grading regardless of which client inserts the row.

```
Grade Table:
≥ 90% → O (Outstanding)
≥ 80% → A+
≥ 70% → A
≥ 60% → B+
≥ 50% → B
≥ 40% → C
 < 40% → F (Fail)
```

### 2.2 User Profile Auto-Creation
`handle_new_user()` trigger fires on `auth.users` INSERT, automatically creates a `public.users` row. This prevents orphaned auth users without profiles.

### 2.3 Unique Constraints
- `results(student_id, course_id, exam_type, semester, academic_year)` — prevents duplicate result entries
- `users(roll_no)` UNIQUE — enforces academic identifier uniqueness

---

## 3. Authentication Flow

```
1. User submits email + password on /login
2. supabase.auth.signInWithPassword() → returns JWT
3. @supabase/ssr stores JWT in httpOnly cookie
4. Next.js middleware runs on every request:
   a. Creates server-side Supabase client with cookie
   b. Calls auth.getUser() to validate token
   c. Queries public.users for role_id
   d. Redirects to /login if unauthenticated
   e. Redirects to correct route if wrong role
5. Server Components receive pre-authenticated client
```

---

## 4. Realtime Architecture

Supabase Realtime (WebSocket) is used for notifications:

```typescript
supabase.channel('notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
      payload => setNotifications(prev => [payload.new, ...prev]))
  .subscribe()
```

RLS applies to realtime events — students only receive their own notification INSERTs.

---

## 5. Chatbot RAG-Ready Design

Current implementation uses a static system prompt. The architecture is ready for RAG:

```
Current:  User Query → System Prompt → GPT → Response
Future:   User Query → Embed Query → Vector Search (pgvector) → 
          Relevant College Docs → System Prompt + Context → GPT → Response
```

To enable RAG: add `pgvector` extension to Supabase, create `knowledge_base` table, embed college documents, modify chatbot API route to perform similarity search before calling GPT.

---

## 6. Folder Conventions

| Pattern | Convention |
|---|---|
| Page components | `page.tsx` (Server Component by default) |
| Interactive pages | `'use client'` directive at top |
| API routes | `route.ts` with named exports (GET, POST, etc.) |
| Shared state | Supabase client + React `useState` (no global store needed) |
| Styling | Global CSS custom properties + utility classes (no Tailwind @apply) |
| Types | Centralized in `src/types/database.types.ts` |

---

## 7. Error Handling Strategy

| Layer | Strategy |
|---|---|
| UI | `react-hot-toast` for user-facing errors |
| API routes | Zod validation → 400; try/catch → 500 with logged error |
| Supabase queries | Check `.error` on every response |
| Chatbot API | Graceful fallback message if OpenAI unavailable |
| Auth | Middleware redirects on invalid session, never throws |
