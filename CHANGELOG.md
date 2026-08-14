# 📜 Changelog

All notable changes to **Smart Campus AI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Contribution guidelines (`CONTRIBUTING.md`)
- Security & responsible-disclosure policy (`SECURITY.md`)
- CI workflow (`.github/workflows/ci.yml`) — lint, typecheck, and build the web app
- Changelog to track project history

---

## [0.1.0] — 2026-08-13

### Added
- **Web app** — Next.js 15 / 16 (App Router) + TypeScript + Tailwind CSS
  - Student portal: courses, results, campus resources
  - Admin dashboard: manage students, courses, and academic data
  - Supabase Auth with role-based access control
  - Row-Level Security (RLS) policies
  - AI chatbot assistant powered by Groq
  - Real-time push & in-app notifications via Supabase Realtime
- **Mobile app** — Expo React Native
  - Screens, navigation stack, and shared components for student & admin flows
- **Database** — Supabase schema, migrations under `supabase/migrations/`, seed data
- **Demo account** documented in the README for quick testing
- **README** — quick start, configuration, project structure, security guidance
- **License** — MIT with non-commercial-use terms

### Security
- Service-role key separation (server-side only)
- Never commit secrets; all sensitive data via environment variables