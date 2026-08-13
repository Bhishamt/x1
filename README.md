# 🚀 Smart Campus AI — ABC Polytechnic Digital Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Online-brightgreen?style=for-the-badge)](https://x1-drab.vercel.app/)
[![License MIT](https://img.shields.io/badge/📄%20License-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?style=for-the-badge&logo=react)](https://expo.dev/)

*A modern, full-stack digital campus platform combining elegance with functionality*

[🌐 Live Demo](https://x1-drab.vercel.app/) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ About This Project

Smart Campus AI is a production-ready, full-stack digital campus platform built for ABC Polytechnic. It seamlessly integrates web (Next.js) and mobile (Expo React Native) experiences to deliver:

- **Student Portals** — Access courses, results, and campus resources
- **Admin Dashboards** — Manage students, courses, and academic data
- **Real-time Notifications** — Push & in-app alerts powered by Supabase
- **AI Chatbot** — Intelligent assistant powered by OpenAI
- **Role-based Access** — Secure, permission-based features

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| ✨ **Modern Web UI** | Built with Next.js 15 + Turbopack for lightning-fast performance |
| 📱 **Cross-Platform Mobile** | Native mobile experience with Expo & React Native |
| 🔐 **Enterprise Security** | Supabase Auth + Row-Level Security (RLS) policies |
| 🔔 **Real-time Notifications** | Instant push & in-app notifications via Supabase |
| 🤖 **AI Assistant** | Intelligent chatbot integrated with OpenAI GPT |
| 📊 **Admin Dashboards** | Powerful tools for student, course & result management |
| 🎨 **Responsive Design** | Optimized for desktop, tablet, and mobile devices |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for cloning the repository
- **Supabase Account** (free tier available)
- **OpenAI API Key** (for AI chatbot features)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Bhishamt/x1.git
cd x1
```

### 2️⃣ Setup Web Application

```bash
cd web
cp .env.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3️⃣ Setup Mobile Application

```bash
cd app
cp .env.example .env
# Fill in your environment variables
npm install
npx expo start
```

Scan the QR code with Expo Go app to see the mobile app.

---

## 🔧 Configuration

### Web Environment Variables (`web/.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COLLEGE_NAME=ABC Polytechnic
```

### Mobile Environment Variables (`app/.env`)

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API Configuration
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

---

## 📂 Project Structure

```
x1/
├── 📁 web/              # Next.js web application (App Router)
│   ├── app/             # App directory (routes & pages)
│   ├── components/      # Reusable React components
│   ├── lib/             # Utility functions & helpers
│   ├── public/          # Static assets
│   └── package.json
├── 📁 app/              # Expo React Native mobile app
│   ├── screens/         # Mobile screens/pages
│   ├── components/      # Shared components
│   ├── navigation/      # Navigation stack
│   └── package.json
├── 📁 supabase/         # Database & Backend
│   ├── migrations/      # SQL migrations
│   └── seeds/           # Sample data
└── 📄 README.md         # This file
```

---

## 🧪 Demo Account

Test the platform with the demo account:

| Field | Value |
|-------|-------|
| **Email** | qwerty@gmail.com |
| **Password** | 123456 |

⚠️ **Note:** This account is for testing only. Do not use for production data.

---

## 🛡️ Security Best Practices

We prioritize security and follow industry best practices:

- ✅ **Never commit secrets** — Use environment variables for all sensitive data
- ✅ **Row-Level Security (RLS)** — All data access is controlled via Supabase RLS policies
- ✅ **Server-side validation** — Admin routes validate user roles server-side
- ✅ **Service role separation** — Service role key used only in trusted server environments
- ✅ **Encrypted communications** — All data in transit is encrypted via HTTPS/TLS

---

## 📚 Documentation

### Database Setup
Run SQL migrations from `supabase/migrations/` using the Supabase SQL Editor:
```bash
# In Supabase Dashboard → SQL Editor
-- Copy and run migrations in order
```

### API Reference
See `/docs` folder for detailed API documentation (if available).

### Deployment
- **Web:** Deploy to [Vercel](https://vercel.com) (recommended)
- **Mobile:** Build with EAS (Expo Application Services)
- **Backend:** Supabase handles all backend infrastructure

---

## 🤝 Contributing

We welcome contributions! Whether it's bug fixes, features, or documentation improvements:

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Guidelines
- Keep changes small and focused
- Add documentation for new features
- Update `.env.example` if adding new variables
- Follow existing code style and patterns

---

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend (Web)** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Frontend (Mobile)** | Expo, React Native, TypeScript |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **AI/ML** | OpenAI GPT API |
| **Deployment** | Vercel (web), EAS (mobile) |

---

## 📊 Status

| Component | Status |
|-----------|--------|
| Web App | ✅ Production Ready |
| Mobile App | ✅ Production Ready |
| Database | ✅ Configured |
| CI/CD | 🔄 In Progress |

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔗 Quick Links

- 🌐 [Live Demo](https://x1-drab.vercel.app/)
- 📖 [Full Documentation](/docs)
- 🐛 [Report Issues](https://github.com/Bhishamt/x1/issues)
- 💬 [Discussions](https://github.com/Bhishamt/x1/discussions)
- 🤝 [Contributing Guide](#contributing)

---

## 📧 Support

Have questions? Reach out:
- Open an [Issue](https://github.com/Bhishamt/x1/issues)
- Start a [Discussion](https://github.com/Bhishamt/x1/discussions)
- Check existing documentation in `/docs`

---

<div align="center">

**Made with ❤️ by [Bhishamt](https://github.com/Bhishamt)**

⭐ If you find this project helpful, please consider giving it a star!

</div>
