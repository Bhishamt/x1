# Deployment Guide
## ABC Polytechnic Digital Platform

---

## Prerequisites

- Node.js 18+
- npm 9+
- Git
- Supabase account
- Vercel account
- OpenAI account (for chatbot)
- Expo CLI: `npm install -g @expo/cli eas-cli`

---

## 1. Database Setup (Supabase)

Follow `supabase/SUPABASE_SETUP.md` for full steps. Quick summary:

```sql
-- Order matters:
1. Run supabase/schema.sql
2. Run supabase/auth_trigger.sql
3. Run supabase/rls.sql
4. Run supabase/seed.sql  (after creating demo users in Auth)
```

**Enable RLS on all tables** (run in SQL Editor):
```sql
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END$$;
```

---

## 2. Web App Deployment (Vercel)

### Step 1 — Push to GitHub
```bash
cd d:\n1\p1\p_imhg
git init
git add .
git commit -m "feat: initial platform implementation"
git remote add origin https://github.com/YOUR_USERNAME/abc-polytechnic.git
git push -u origin main
```

### Step 2 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select `abc-polytechnic`
3. Set **Root Directory** to `p_imhg/web`
4. Framework: **Next.js** (auto-detected)
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL    = https://uufmfjhbwqkoqotyqhfs.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY   = eyJhbGci...
   OPENAI_API_KEY              = sk-proj-...
   NEXT_PUBLIC_APP_URL         = https://your-project.vercel.app
   ```
6. Click **Deploy** → wait ~2 min

### Step 3 — Update Supabase Auth URLs
In Supabase → Authentication → Settings:
- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/auth/callback`

---

## 3. Mobile App Deployment (Expo EAS)

### Step 1 — Configure app.json
```json
{
  "expo": {
    "name": "ABC Polytechnic",
    "slug": "abc-polytechnic",
    "version": "1.0.0",
    "scheme": "abcpolytechnic"
  }
}
```

### Step 2 — EAS Build
```bash
cd d:\n1\p1\p_imhg\app
eas login
eas build:configure
eas build --platform android  # For APK
eas build --platform ios      # For IPA (requires Apple account)
```

### Step 3 — OTA Update (after code changes)
```bash
eas update --branch production --message "Bug fixes"
```

---

## 4. Environment Variables Reference

### Web (`web/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (SERVER ONLY) |
| `OPENAI_API_KEY` | OpenAI API key (SERVER ONLY) |
| `NEXT_PUBLIC_APP_URL` | App base URL |

### Mobile (`app/.env`)
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

---

## 5. Local Development

```bash
# Web
cd d:\n1\p1\p_imhg\web
npm run dev
# Open http://localhost:3000

# Mobile
cd d:\n1\p1\p_imhg\app
npm start
# Scan QR code with Expo Go app
```

---

## 6. Post-Deployment Checklist

- [ ] SQL schema, RLS, and seed successfully applied
- [ ] Demo admin login works and redirects to /admin/dashboard
- [ ] Demo student login works and shows profile/results
- [ ] Results page shows grades correctly
- [ ] Announcements page shows pinned items first
- [ ] Chatbot responds only to college-related queries
- [ ] Real-time notifications arrive without page refresh
- [ ] Vercel deployment passes build check
