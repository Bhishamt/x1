-- ============================================================
-- COLLEGE DIGITAL PLATFORM — DATABASE SCHEMA
-- ABC Polytechnic
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE public.roles (
  id   SMALLINT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE  -- 'admin' | 'student'
);

INSERT INTO public.roles (id, name) VALUES
  (1, 'admin'),
  (2, 'student');

-- ============================================================
-- 2. USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id       SMALLINT NOT NULL REFERENCES public.roles(id) DEFAULT 2,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  roll_no       TEXT UNIQUE,                -- students only
  department    TEXT,
  year          SMALLINT,                  -- academic year (1-4)
  avatar_url    TEXT,
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 3. COURSES
-- ============================================================
CREATE TABLE public.courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          TEXT NOT NULL UNIQUE,      -- e.g. "CS301"
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  year          SMALLINT NOT NULL,
  semester      SMALLINT NOT NULL,
  credits       SMALLINT NOT NULL DEFAULT 3,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 4. RESULTS
-- ============================================================
CREATE TABLE public.results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  exam_type       TEXT NOT NULL,           -- 'internal' | 'mid' | 'final'
  marks_obtained  NUMERIC(5,2) NOT NULL,
  max_marks       NUMERIC(5,2) NOT NULL DEFAULT 100,
  grade           TEXT,                    -- A+, A, B, etc.
  semester        SMALLINT NOT NULL,
  academic_year   TEXT NOT NULL,           -- e.g. "2024-25"
  remarks         TEXT,
  uploaded_by     UUID REFERENCES public.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id, exam_type, semester, academic_year)
);

CREATE TRIGGER results_updated_at
  BEFORE UPDATE ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grade auto-compute trigger
CREATE OR REPLACE FUNCTION public.compute_grade()
RETURNS TRIGGER AS $$
DECLARE
  pct NUMERIC;
BEGIN
  pct := (NEW.marks_obtained / NEW.max_marks) * 100;
  NEW.grade := CASE
    WHEN pct >= 90 THEN 'O'
    WHEN pct >= 80 THEN 'A+'
    WHEN pct >= 70 THEN 'A'
    WHEN pct >= 60 THEN 'B+'
    WHEN pct >= 50 THEN 'B'
    WHEN pct >= 40 THEN 'C'
    ELSE 'F'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER results_grade
  BEFORE INSERT OR UPDATE ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.compute_grade();

-- ============================================================
-- 5. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE public.announcements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'general', -- 'general' | 'exam' | 'event' | 'placement'
  target_role   SMALLINT REFERENCES public.roles(id), -- NULL = all roles
  is_pinned     BOOLEAN NOT NULL DEFAULT FALSE,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  published_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',  -- 'info' | 'success' | 'warning' | 'error'
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,                          -- optional deep-link
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient per-user queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

-- ============================================================
-- 7. CHATBOT LOGS
-- ============================================================
CREATE TABLE public.chatbot_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id    TEXT NOT NULL,
  user_message  TEXT NOT NULL,
  bot_response  TEXT NOT NULL,
  tokens_used   INTEGER,
  response_ms   INTEGER,                    -- latency in ms
  is_flagged    BOOLEAN NOT NULL DEFAULT FALSE,
  platform      TEXT NOT NULL DEFAULT 'web', -- 'web' | 'mobile'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chatbot_logs_user_id ON public.chatbot_logs(user_id);
CREATE INDEX idx_chatbot_logs_session  ON public.chatbot_logs(session_id);

-- ============================================================
-- VIEWS
-- ============================================================

-- Student result summary view
CREATE OR REPLACE VIEW public.student_result_summary AS
SELECT
  r.student_id,
  u.full_name,
  u.roll_no,
  r.academic_year,
  r.semester,
  COUNT(r.id)                                    AS total_subjects,
  ROUND(AVG(r.marks_obtained / r.max_marks * 100), 2) AS percentage,
  SUM(CASE WHEN r.grade = 'F' THEN 1 ELSE 0 END) AS failed_subjects
FROM public.results r
JOIN public.users u ON u.id = r.student_id
GROUP BY r.student_id, u.full_name, u.roll_no, r.academic_year, r.semester;
