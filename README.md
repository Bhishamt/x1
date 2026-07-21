# ABC Polytechnic Institute — Digital Platform

A full-stack digital platform for **ABC Polytechnic Institute** built with **Next.js** (web) + **Expo React Native** (mobile).

> Live demo: [Smart Campus AI Web Application](https://x1-drab.vercel.app/)

## Quick overview

This repository contains a web app (Next.js) and a mobile app (Expo React Native) that together provide a digital campus experience: student portals, admin dashboard, notifications, and an AI-powered chatbot assistant.

## Features

### Student Portal
- 🔐 Secure login with Supabase Auth
- 📊 Academic results viewing
- 📢 Real-time announcements & notices
- 🔔 Real-time push notifications (in-app + device push)
- 👤 Profile management
- 🤖 AI chatbot assistant

### Admin Panel (Web & Mobile)
- 📢 Broadcast notifications — all students / by department / by year
- 🎓 Student management
- 📋 Course & result management
- 📊 Overview statistics

## Live Demo

Try the deployed web demo:

- Smart Campus AI Web Application — https://x1-drab.vercel.app/

(If the demo link is down or you see development content, make sure environment variables are configured for the deployed site.)

## Demo Credentials (Student)

For convenience, a demo student account is available on the deployed site:

- Username: `qwerty@gmail.com`
- Password: `123456`

Note: This is a demo/test account only. Do NOT use these credentials for any production or sensitive data. If you need additional demo accounts or different credentials, update the Supabase seed data or contact the repo owner.

## Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | Next.js 15 + Turbopack |
| Mobile App | Expo SDK 54 + React Native |
| Backend / Auth | Supabase (PostgreSQL + Auth + Realtime) |
| Push Notifications | Expo Push API (free) |
| AI Chatbot | OpenAI GPT |
| Styling | Vanilla CSS (dark theme) |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key

### Web App
```bash
cd web
cp .env.example .env.local
# Fill in your keys in .env.local
npm install
npm run dev
```

### Mobile App
```bash
cd app
cp .env.example .env
# Fill in your keys in .env
npm install
npx expo start
```

## Environment Variables

### Web (`web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COLLEGE_NAME=ABC Polytechnic
```

### Mobile (`app/.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

## Database Setup

Run the SQL migrations in `supabase/migrations/` in your Supabase SQL Editor.

## Project Structure

```
abc/
├── web/          # Next.js web application
│   ├── src/app/
│   │   ├── admin/      # Admin dashboard pages
│   │   └── student/    # Student portal pages
│   └── src/components/
├── app/          # Expo React Native mobile app
│   ├── app/
│   │   ├── (auth)/     # Login screen
│   │   └── (student)/  # Student + admin tabs
│   └── src/
│       ├── context/    # AuthContext (role-based)
│       └── lib/        # Supabase client, types, notifications
└── supabase/     # SQL migrations
```

## Screenshots

_Add screenshots here or link to the deployed site above._

## Security

- All secrets stored in `.env` / `.env.local` (git-ignored)
- Role-based access: `role_id = 1` admin, `role_id = 2` student
- Supabase Row Level Security (RLS) policies enforced
- Server-side admin API routes validate role before executing
- Push notifications filtered per user (`user_id=eq.{uuid}`)

## Contributing

Contributions welcome — please open issues or PRs. If you're adding features that require new environment variables, include updates to the README and `.env.example` files.

## License

MIT
