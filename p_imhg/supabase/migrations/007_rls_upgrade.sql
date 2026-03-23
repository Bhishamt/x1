-- ============================================================
-- MIGRATION 007: RLS POLICY UPGRADE
-- Adds department-level isolation and new helper functions
-- Run AFTER all previous migrations
-- ============================================================

-- -----------------------------------------------
-- NEW HELPER FUNCTIONS
-- -----------------------------------------------

-- Check if current user is super_admin (role_id = 1)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role_id = 1
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is any staff role (not a student)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role_id IN (1, 2, 3, 4)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's department
CREATE OR REPLACE FUNCTION public.user_department()
RETURNS TEXT AS $$
  SELECT department FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update is_admin() to mean super_admin or admin (backward compat)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role_id IN (1, 2)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------
-- UPDATE EXISTING RLS POLICIES
-- -----------------------------------------------

-- == USERS TABLE ==
-- Drop existing policies and recreate
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;

-- Staff can see users in their department; super_admin/admin see all; users see self
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    auth.uid() = id
    OR public.is_admin()
    OR (public.is_staff() AND department = public.user_department())
  );

-- Only super_admin/admin can insert users
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

-- Users update own profile; admin can update any
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  );

-- Only super_admin can delete users
CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (public.is_super_admin());

-- == RESULTS TABLE ==
DROP POLICY IF EXISTS "results_select" ON public.results;
DROP POLICY IF EXISTS "results_insert" ON public.results;
DROP POLICY IF EXISTS "results_update" ON public.results;
DROP POLICY IF EXISTS "results_delete" ON public.results;

-- Students see own results; staff see results for their department courses
CREATE POLICY "results_select" ON public.results
  FOR SELECT USING (
    auth.uid() = student_id
    OR public.is_admin()
    OR (public.is_staff() AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.department = public.user_department()
    ))
  );

-- Staff can insert results (for their dept courses); admin can insert any
CREATE POLICY "results_insert" ON public.results
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR (public.is_staff() AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.department = public.user_department()
    ))
  );

-- Only admin can update results (for correction approvals)
CREATE POLICY "results_update" ON public.results
  FOR UPDATE USING (public.is_admin());

-- Only super_admin can delete results
CREATE POLICY "results_delete" ON public.results
  FOR DELETE USING (public.is_super_admin());

-- == COURSES TABLE ==
-- (keep existing — all authenticated users can view courses)

-- -----------------------------------------------
-- RLS FOR NEW TABLES
-- -----------------------------------------------

-- == RESULT CORRECTIONS ==
ALTER TABLE public.result_corrections ENABLE ROW LEVEL SECURITY;

-- Staff see corrections they created or for their dept; admin sees all
CREATE POLICY "corrections_select" ON public.result_corrections
  FOR SELECT USING (
    public.is_admin()
    OR requested_by = auth.uid()
    OR (public.is_staff() AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.department = public.user_department()
    ))
  );

-- Staff can create correction requests
CREATE POLICY "corrections_insert" ON public.result_corrections
  FOR INSERT WITH CHECK (public.is_staff());

-- Only super_admin/admin can update (approve/reject)
CREATE POLICY "corrections_update" ON public.result_corrections
  FOR UPDATE USING (public.is_admin());

-- Only super_admin can delete
CREATE POLICY "corrections_delete" ON public.result_corrections
  FOR DELETE USING (public.is_super_admin());

-- == PUSH TOKENS ==
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can see their own tokens
CREATE POLICY "push_tokens_select" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Users can register their token
CREATE POLICY "push_tokens_insert" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own token
CREATE POLICY "push_tokens_update" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own token
CREATE POLICY "push_tokens_delete" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- == ANNOUNCEMENT READS ==
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Users see their own read status; admin sees all
CREATE POLICY "ann_reads_select" ON public.announcement_reads
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Users can mark announcements as read
CREATE POLICY "ann_reads_insert" ON public.announcement_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No updates or deletes needed for reads — admin can delete if needed
CREATE POLICY "ann_reads_delete" ON public.announcement_reads
  FOR DELETE USING (public.is_admin());
