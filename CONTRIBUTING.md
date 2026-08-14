# 🤝 Contributing to Smart Campus AI

First off, thank you for taking the time to contribute! 🎉 Every pull request, bug report, and improvement helps make Smart Campus AI better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive, and harassment-free environment. Be respectful, constructive, and kind in all interactions — in issues, PRs, and discussions.

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Git**
- **Supabase Account** (free tier is fine)
- **Groq API Key** (for the AI chatbot — get one at [console.groq.com/keys](https://console.groq.com/keys))

### Setup

```bash
# 1. Fork the repository
git clone https://github.com/<your-username>/x1.git
cd x1

# 2. Install dependencies
cd web && npm install
cd ../app && npm install

# 3. Set up environment variables
cp web/.env.example web/.env.local
cp app/.env.example app/.env

# 4. Run the web app
cd web && npm run dev   # → http://localhost:3000

# 5. Run the mobile app (in another terminal)
cd app && npx expo start
```

## How to Contribute

### 🐛 Bug Reports
Open an issue with:
- A clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or error logs if available

### 👷 Features & Improvements
1. Check [open issues](https://github.com/Bhishamt/x1/issues) to avoid duplicates
2. Open a discussion or issue describing the feature before building
3. Keep changes small, focused, and reviewable

### 📝 Documentation
Documentation improvements are always welcome. Update the relevant README, docs, and comments alongside any code change that affects them.

## Development Workflow

1. **Create a feature branch** from `main`:

```bash
git checkout -b feature/your-feature
```

2. **Make focused changes**. One logical change per commit.

3. **Keep the main branch green** — run lint and build checks before pushing:

```bash
cd web
npm run lint
npm run build
```

4. **Push and open a Pull Request**

```bash
git push origin feature/your-feature
# Then open a PR on GitHub
```

## Commit Guidelines

We follow a lightweight [Conventional Commits](https://www.conventionalcommits.org/) style:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature or functionality |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no code-behavior change |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance tasks (deps, scripts, config) |
| `ci:` | CI configuration changes |

Examples:

```text
feat(web): add course enrollment flow
fix(app): handle expired session on startup
docs: update quick-start with Groq key step
```

## Style Guide

- **TypeScript** — use strict typing; avoid `any` unless truly necessary
- **Naming** — clear, descriptive names for variables, functions, and components
- **Components** — keep them small and composable
- **CSS/Tailwind** — use the existing Tailwind utility patterns; prefer Tailwind over custom CSS
- **No secrets** — never commit `.env.local`, `.env`, or real API keys

## Testing

The project currently has no automated test suite, but that doesn't mean untested:

- Manually verify your change on both **web** and **mobile** where relevant
- If you add a pure-logic module, consider adding a small unit test
- Keep existing flows working: login, course listing, results, notifications, and the chatbot

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Add a clear PR title and description referencing any related issues
3. Update documentation (README, env examples) if your change affects them
4. Keep PRs small — if it's getting big, split it into multiple PRs
5. A maintainer will review, request changes if needed, then merge

---

## Thank You ✨

Every contribution — no matter how small — helps. If you have questions, open an issue or start a discussion. Happy coding!