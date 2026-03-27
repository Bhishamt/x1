# Product Requirements Document (PRD)
## ABC Polytechnic Digital Platform

**Version:** 1.0 | **Date:** February 2026

---

## 1. Product Summary

A full-stack college portal with web (Next.js 14) and mobile (Expo) interfaces, backed by Supabase. Provides role-based dashboards for students and admins with real-time data, secure authentication, and an AI chatbot.

---

## 2. User Personas

### Ananya Sharma — 3rd Year CS Student
- Wants to check results without visiting the office
- Wants exam and placement notification on her phone
- Asks the chatbot about fee deadlines and exam schedules

### Dr. Rajesh Kumar — Admin / HoD
- Needs to upload semester results for 200+ students
- Posts exam schedule announcements instantly
- Sends targeted notifications to specific students

---

## 3. Feature Requirements

### 3.1 Authentication

| ID | Feature | Priority |
|---|---|---|
| AUTH-01 | Email/password login | P0 |
| AUTH-02 | Role-based redirect (admin/student) | P0 |
| AUTH-03 | Session persistence via cookies | P0 |
| AUTH-04 | Auto-create user profile on sign-up | P0 |
| AUTH-05 | Logout | P0 |

### 3.2 Student Features

| ID | Feature | Priority |
|---|---|---|
| STU-01 | View profile (name, roll no, dept, year) | P0 |
| STU-02 | View results grouped by semester | P0 |
| STU-03 | View grade and percentage | P0 |
| STU-04 | View announcements (filtered by role) | P0 |
| STU-05 | View notifications (real-time) | P0 |
| STU-06 | Mark notifications as read | P1 |
| STU-07 | Chat with AI assistant | P1 |

### 3.3 Admin Features

| ID | Feature | Priority |
|---|---|---|
| ADM-01 | Dashboard with stats | P0 |
| ADM-02 | View all students | P0 |
| ADM-03 | Add/Edit/Delete courses | P0 |
| ADM-04 | Upload student results (with grade auto-compute) | P0 |
| ADM-05 | Add/Edit/Delete announcements | P0 |
| ADM-06 | Send notifications to specific students | P0 |
| ADM-07 | View chatbot logs | P2 |

### 3.4 Chatbot

| ID | Feature | Priority |
|---|---|---|
| BOT-01 | Controlled system prompt (college-only) | P0 |
| BOT-02 | Log all conversations to DB | P1 |
| BOT-03 | Available on web and mobile | P0 |
| BOT-04 | Graceful fallback when API unavailable | P1 |

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | RLS on all tables, no client-side service role key |
| **Performance** | Page load < 2s, API response < 500ms |
| **Scalability** | Supabase managed PostgreSQL, serverless Next.js |
| **Availability** | 99.9% uptime via Vercel + Supabase |
| **Accessibility** | Responsive on all screen sizes |

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Mobile | Expo SDK 51, React Native, TypeScript |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| AI Chatbot | OpenAI GPT-3.5-turbo |
| Hosting | Vercel (web), Expo EAS (mobile) |
