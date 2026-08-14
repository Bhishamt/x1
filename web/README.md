# 🖥️ Smart Campus AI — Web Application

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://x1-drab.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=nextdotjs)](https://nextjs.org/)

The web frontend of **Smart Campus AI**, built with Next.js (App Router), TypeScript,
and Tailwind CSS. It connects to Supabase for auth, data, realtime, and the AI
chatbot (powered by Groq).

## ✨ Features

- **Student portal** — browse courses, view results, access campus resources
- **Admin dashboard** — manage students, courses, and academic data
- **Role-based access** — Supabase Auth + Row-Level Security (RLS)
- **Real-time notifications** — powered by Supabase Realtime
- **AI chatbot** — intelligent assistant powered by the Groq API
- **Responsive UI** — designed for desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- A **Supabase** project (free tier is fine)
- A **Groq API key** from [console.groq.com/keys](https://console.groq.com/keys)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
#  → fill in your Supabase URL, anon key, and Groq API key

# 3. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
app.

> 💡 The AI chatbot does not work without a valid `GROQ_API_KEY`. All other
> features only need the Supabase variables.

## 🔧 Environment Variables

See `.env.example` for the full, documented list:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key (never expose) |
| `GROQ_API_KEY` | Groq key used to power the AI chatbot |
| `NEXT_PUBLIC_APP_URL` | Public URL of this app (default `http://localhost:3000`) |
| `NEXT_PUBLIC_COLLEGE_NAME` | College name shown across the UI |

⚠️ **Never commit real keys.** `.env.local` is git-ignored.

## 🧪 Useful Scripts

```bash
npm run dev       # start the dev server (Turbopack)
npm run build     # production build
npm run start     # serve the production build
npm run lint      # run ESLint
```

## 🧱 Tech Stack

- **Framework** — Next.js 16 (App Router) + React 19
- **Language** — TypeScript
- **Styling** — Tailwind CSS 4
- **Backend** — Supabase (Postgres, Auth, Realtime)
- **AI** — Groq API

## 📦 Deployment

Deploy on **Vercel**:

1. Push this repo to GitHub
2. Import it into Vercel (root directory: `web`)
3. Add the environment variables from `.env.example`
4. Deploy — done

Alternatively, use the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

## 📄 License

Part of the **Smart Campus AI** project — see the [LICENSE](../LICENSE) in the repo root.