# 🔒 Security Policy

Smart Campus AI takes security seriously. This document describes how to report
vulnerabilities and what you can expect from us in return.

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| main    | ✅ Fully supported |

Currently the project is in active development. All fixes are applied to `main`
and released as updates to the deployed demo.

## Reporting a Vulnerability

**Please do NOT open a public issue for security vulnerabilities.**

Instead, report it privately:

- **GitHub Private Vulnerability Reporting** — use the
  [Security Advisories](https://github.com/Bhishamt/x1/security/advisories)
  tab on the repository (preferred), or
- **Email the maintainer** — reach out via the contact details on the
  [GitHub profile](https://github.com/Bhishamt).

### What to include

To help us triage quickly, please include:

1. **Affected component** — web app, mobile app, Supabase/DB, auth, chatbot, etc.
2. **Description** — what the vulnerability is and how it can be exploited
3. **Steps to reproduce** — a small, self-contained example
4. **Impact** — what an attacker could gain
5. **Suggested fix** (optional but appreciated)

### Our commitment

- You will receive an acknowledgment within **48 hours**
- We will investigate and keep you updated on progress
- We will coordinate a fix and, where appropriate, credit you in the changelog
- We will not pursue legal action for **good-faith** reports made in accordance
  with this policy

## Security Best Practices (project-wide)

- **Never commit secrets** — keys live in `.env.*` files which are git-ignored
- **Environment variables** — all sensitive configuration is injected at runtime
- **Supabase RLS** — Row-Level Security policies gate every table access
- **Service-role key** — used only in trusted, server-side environments, never
  exposed to the browser
- **Server-side validation** — admin routes re-validate roles on the server
- **HTTPS/TLS** — all traffic is encrypted in transit

## Scope

In-scope: the repositories and deployed demos owned by the project.

Out-of-scope: third-party services you connect (Supabase, Groq, Vercel) — report
issues to those vendors directly.