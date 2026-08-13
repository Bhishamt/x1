# Smart Campus AI — ABC Polytechnic Digital Platform

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://x1-drab.vercel.app/)  [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An elegant, full-stack digital campus platform for ABC Polytechnic — web (Next.js) + mobile (Expo React Native) — delivering student portals, admin dashboards, real-time notifications, and an AI-powered assistant.

Quick links
- Live demo: https://x1-drab.vercel.app/
- Web: /web
- Mobile app: /app

Why this project
- Built to provide a production-ready campus experience with role-based access, realtime features, and AI assistance.
- Focused on simplicity, security (Supabase + RLS), and cross-platform UX.

Features
- ✨ Modern web UI (Next.js 15 + Turbopack)
- 📱 Cross-platform mobile (Expo + React Native)
- 🔐 Supabase Auth + Role-based access control
- 🔔 Realtime push & in-app notifications
- 🤖 AI chatbot integrated with OpenAI
- 📊 Admin dashboards for student, course & result management

Demo account (student)
- Email: qwerty@gmail.com
- Password: 123456

Note: demo account is for testing only. Do NOT use it for production data.

Table of contents
- Quick start
- Development
- Environment
- Database
- Project structure
- Contributing
- License

Quick start
1. Clone

```bash
git clone https://github.com/Bhishamt/x1.git
cd x1
```

2. Web — run locally

```bash
cd web
cp .env.example .env.local
# fill values, then:
npm install
npm run dev
```

3. Mobile — run locally

```bash
cd app
cp .env.example .env
# fill values, then:
npm install
npx expo start
```

Environment (important keys)

Web (web/.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COLLEGE_NAME=ABC Polytechnic
```

Mobile (app/.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Database
- Run SQL migrations found in supabase/migrations/ using the Supabase SQL Editor.

Project structure (high level)

```
abc/
├── web/          # Next.js web application (app dir)
├── app/          # Expo React Native mobile app
└── supabase/     # SQL migrations & seeds
```

Screenshots
Add retina-ready screenshots or animated GIFs in the `assets/` folder and reference them here to show the experience.

Security & best practices
- Secrets must remain in environment variables (.env / .env.local) — never commit keys.
- Supabase RLS policies are enforced; server-side admin routes validate role.
- Use the service role key only in trusted server environments.

Contributing
Contributions welcome — open issues or PRs. If adding features that require new environment variables, update README and .env.example files. Keep changes small and documented.

License
MIT
