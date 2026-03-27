-- ============================================================
-- Polytechnic College Management System — RLS Policies
-- Roles: 1=super_admin, 2=hod, 3=class_incharge, 4=student
-- is_admin() = role_id <= 3 (super_admin, hod, class_incharge)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════
-- ROLES
-- ══════════════════════════════════════════
CREATE POLICY "roles_select" ON public.roles FOR SELECT USING (TRUE);

-- ══════════════════════════════════════════
-- USERS
-- ══════════════════════════════════════════
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_admin_update" ON public.users
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "users_admin_insert" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════
-- ADMINS
-- ══════════════════════════════════════════
CREATE POLICY "admins_select" ON public.admins
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admins_insert" ON public.admins
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "admins_update" ON public.admins
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "admins_delete" ON public.admins
  FOR DELETE USING (public.is_super_admin());

-- ══════════════════════════════════════════
-- SUBJECTS
-- ══════════════════════════════════════════
CREATE POLICY "subjects_select" ON public.subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "subjects_insert" ON public.subjects
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "subjects_update" ON public.subjects
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "subjects_delete" ON public.subjects
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════
-- RESULTS
-- ══════════════════════════════════════════
CREATE POLICY "results_select_own" ON public.results
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "results_admin_insert" ON public.results
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "results_admin_update" ON public.results
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "results_admin_delete" ON public.results
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════
-- RESULT CORRECTIONS
-- ══════════════════════════════════════════
CREATE POLICY "corrections_select" ON public.result_corrections
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "corrections_insert" ON public.result_corrections
  FOR INSERT WITH CHECK (
    requested_by = auth.uid()
  );

CREATE POLICY "corrections_admin_update" ON public.result_corrections
  FOR UPDATE USING (public.is_admin());

-- ══════════════════════════════════════════
-- ANNOUNCEMENTS
-- ══════════════════════════════════════════
CREATE POLICY "announcements_select" ON public.announcements
  FOR SELECT USING (
    is_published = TRUE OR public.is_admin()
  );

CREATE POLICY "announcements_admin_insert" ON public.announcements
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "announcements_admin_update" ON public.announcements
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "announcements_admin_delete" ON public.announcements
  FOR DELETE USING (public.is_admin());

-- ══════════════════════════════════════════
-- ANNOUNCEMENT READS
-- ══════════════════════════════════════════
CREATE POLICY "announcement_reads_select" ON public.announcement_reads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "announcement_reads_insert" ON public.announcement_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ══════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════
-- PUSH TOKENS
-- ══════════════════════════════════════════
CREATE POLICY "push_tokens_select" ON public.push_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "push_tokens_insert" ON public.push_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_tokens_delete" ON public.push_tokens
  FOR DELETE USING (user_id = auth.uid());

-- ══════════════════════════════════════════
-- CHATBOT LOGS
-- ══════════════════════════════════════════
CREATE POLICY "chatbot_logs_select" ON public.chatbot_logs
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "chatbot_logs_insert" ON public.chatbot_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
