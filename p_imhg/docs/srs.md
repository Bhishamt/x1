# Software Requirements Specification (SRS)
## ABC Polytechnic Digital Platform — v1.0

---

## 1. Introduction

### 1.1 Purpose
This SRS describes the complete functional and non-functional requirements for the ABC Polytechnic Digital Platform, intended as a production-ready Final Year Engineering Project.

### 1.2 Definitions
| Term | Meaning |
|---|---|
| RLS | Row Level Security (PostgreSQL feature) |
| JWT | JSON Web Token (used for auth sessions) |
| RSC | React Server Component |
| EAS | Expo Application Services |

---

## 2. Overall Description

### 2.1 System Perspective
The platform consists of three tiers:
1. **Presentation** — Next.js web + Expo mobile
2. **API** — Supabase PostgREST + Next.js API routes
3. **Data** — Supabase PostgreSQL with RLS

### 2.2 User Classes
- **Student (role_id = 2):** Reads-only access to own data
- **Admin (role_id = 1):** Full CRUD access via admin panel

---

## 3. Functional Requirements

### FR-1: Authentication
| ID | Requirement |
|---|---|
| FR-1.1 | System shall authenticate users via email/password |
| FR-1.2 | System shall reject invalid credentials with a clear message |
| FR-1.3 | System shall create a user profile row on first sign-up via trigger |
| FR-1.4 | System shall redirect users to role-appropriate dashboard after login |
| FR-1.5 | System shall invalidate session on logout |
| FR-1.6 | Middleware shall protect all non-public routes |

### FR-2: Student Portal
| ID | Requirement |
|---|---|
| FR-2.1 | Student shall view their own profile data |
| FR-2.2 | Student shall view all results grouped by semester |
| FR-2.3 | System shall auto-compute and display grade (O, A+, A, B+, B, C, F) |
| FR-2.4 | Student shall view all published announcements targeted to them |
| FR-2.5 | Student shall receive real-time notifications via WebSocket |
| FR-2.6 | Student shall mark notifications as read |
| FR-2.7 | Student shall interact with AI chatbot |
| FR-2.8 | Chatbot shall only answer college-related questions |

### FR-3: Admin Panel
| ID | Requirement |
|---|---|
| FR-3.1 | Admin shall view a dashboard with aggregated statistics |
| FR-3.2 | Admin shall view a list of all registered students |
| FR-3.3 | Admin shall create, update, and delete courses |
| FR-3.4 | Admin shall upload results for any student-course combination |
| FR-3.5 | Admin shall create, update, delete, pin, and publish announcements |
| FR-3.6 | Admin shall send targeted notifications to any student |
| FR-3.7 | Admin shall delete any notification |

### FR-4: Security
| ID | Requirement |
|---|---|
| FR-4.1 | All database tables shall have RLS enabled |
| FR-4.2 | Students shall not access other students' results or notifications |
| FR-4.3 | Service-role key shall never be exposed to the client |
| FR-4.4 | API routes shall validate inputs with Zod |
| FR-4.5 | Chatbot API shall reject messages > 500 characters |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Initial page load (web) < 2 seconds on 4G |
| NFR-2 | Performance | API response time < 500ms (p95) |
| NFR-3 | Scalability | Database shall support 10,000+ students |
| NFR-4 | Security | All transport encrypted with TLS 1.2+ |
| NFR-5 | Reliability | 99.9% uptime SLA |
| NFR-6 | Usability | Mobile app responsive on screens ≥ 360px |
| NFR-7 | Maintainability | TypeScript strict mode, no `any` in production code |
| NFR-8 | Portability | App deployable to Android and iOS |

---

## 5. External Interface Requirements

| Interface | Description |
|---|---|
| Supabase API | REST + Realtime WebSocket via @supabase/supabase-js |
| OpenAI API | POST https://api.openai.com/v1/chat/completions |
| Vercel | Deployment + CDN + Serverless functions |
| Expo EAS | Mobile build + OTA updates |
