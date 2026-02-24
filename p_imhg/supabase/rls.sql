-- ============================================================
-- COLLEGE DIGITAL PLATFORM — ROW LEVEL SECURITY POLICIES
-- Run this AFTER schema.sql
-- ============================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role_id = 1
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user role_id
CREATE OR REPLACE FUNCTION public.current_role_id()
RETURNS SMALLINT AS $$
  SELECT role_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- users table
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record; admins can read all
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
  );

-- Only admins can insert users (normal sign-up handled by trigger)
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

-- Users can update their own profile; admins can update any
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  );

-- Only admins can deactivate/delete users
CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- courses table
-- ============================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active courses
CREATE POLICY "courses_select" ON public.courses
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage courses
CREATE POLICY "courses_insert" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "courses_update" ON public.courses
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "courses_delete" ON public.courses
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- results table
-- ============================================================
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Students see only their results; admins see all
CREATE POLICY "results_select" ON public.results
  FOR SELECT USING (
    auth.uid() = student_id OR public.is_admin()
  );

-- Only admins can insert/update/delete results
CREATE POLICY "results_insert" ON public.results
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "results_update" ON public.results
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "results_delete" ON public.results
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- announcements table
-- ============================================================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Published announcements visible to matching role or all
CREATE POLICY "announcements_select" ON public.announcements
  FOR SELECT USING (
    is_published = TRUE
    AND (
      target_role IS NULL
      OR target_role = public.current_role_id()
      OR public.is_admin()
    )
  );

-- Only admins can manage announcements
CREATE POLICY "announcements_insert" ON public.announcements
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "announcements_update" ON public.announcements
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "announcements_delete" ON public.announcements
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- notifications table
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their notifications; admins see all
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- Only admins can create notifications
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- Users can mark their own as read; admins manage all
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- chatbot_logs table
-- ============================================================
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own logs; admins see all
CREATE POLICY "chatbot_logs_select" ON public.chatbot_logs
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- Any authenticated user (or anon for guest chat) can insert logs
CREATE POLICY "chatbot_logs_insert" ON public.chatbot_logs
  FOR INSERT WITH CHECK (TRUE);

-- Only admins can update/flag logs
CREATE POLICY "chatbot_logs_update" ON public.chatbot_logs
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "chatbot_logs_delete" ON public.chatbot_logs
  FOR DELETE USING (public.is_admin());
