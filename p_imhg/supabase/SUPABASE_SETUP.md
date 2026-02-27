# Supabase Setup Guide — ABC Polytechnic Digital Platform

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Fill in:
   - **Organization**: your org
   - **Name**: `abc-polytechnic`
   - **Database Password**: (save securely)
   - **Region**: Asia (Mumbai / Singapore)
4. Click **Create new project** and wait ~2 min.

---

## Step 2: Run the SQL Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **New Query**.
3. Paste the contents of `supabase/schema.sql` → **Run**.
4. Paste the contents of `supabase/auth_trigger.sql` → **Run**.
5. Paste the contents of `supabase/rls.sql` → **Run**.

Verify tables exist: go to **Table Editor** → you should see:
`roles`, `users`, `courses`, `results`, `announcements`, `notifications`, `chatbot_logs`

---

## Step 3: Configure Authentication

1. Go to **Authentication > Settings**.
2. Under **Email**, ensure **Enable Email Signup** is ON.
3. Under **Auth Providers**, disable unnecessary providers.
4. Set **Site URL**: `http://localhost:3000` (change to prod URL later).
5. Set **Redirect URLs**: `http://localhost:3000/auth/callback`.

### Create Demo Users (for testing)

1. Go to **Authentication > Users > Invite User**.
2. Create an admin user (e.g. `admin@yourschool.edu`)
3. Create a student user (e.g. `student1@yourschool.edu`)
4. Copy their UUIDs.
5. Open `supabase/seed.sql`, replace the placeholder UUIDs with actual UUIDs.
6. Run `seed.sql` in SQL Editor.

---
`
## Step 4: Get Your API Keys

1. Go to **Project Settings > API**.
2. Copy:
   - **Project URL** → `https://YOUR_PROJECT_ID.supabase.co`
   - **anon public key** → the long `eyJ...` string under "anon public"
   - **service_role secret key** → the `eyJ...` string under "service_role" *(never expose client-side)*

---

## Step 5: Configure Environment Variables

Copy the example files and fill in your keys:

```bash
# Web app
cp web/.env.example web/.env.local

# Mobile app
cp app/.env.example app/.env
```

### Web app (`web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here   # server-side only
OPENAI_API_KEY=sk-...your_openai_key_here              # for chatbot
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mobile app (`app/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

---

## Step 6: Enable Realtime (optional but recommended)

1. Go to **Database > Replication**.
2. Enable replication for: `announcements`, `notifications`.
3. In your web/app code, Supabase Realtime subscriptions will auto-update UI.

---

## Step 7: Storage (for avatars / result uploads)

1. Go to **Storage > Create Bucket**.
2. Create bucket: `avatars` (public).
3. Create bucket: `results-docs` (private, admin only).

---

## Step 8: Verify Setup

Run this query in SQL Editor to confirm everything is working:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
announcements
chatbot_logs
courses
notifications
results
roles
users
```

Then check RLS is active:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All `rowsecurity` values should be `true`.
