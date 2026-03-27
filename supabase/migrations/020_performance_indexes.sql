-- ============================================================
-- 020: PERFORMANCE INDEXES
-- ============================================================

-- Indexes for admins table (sorting by role and name)
CREATE INDEX IF NOT EXISTS idx_admins_role_name ON public.admins(role, name);
CREATE INDEX IF NOT EXISTS idx_admins_status ON public.admins(status);

-- Indexes for users table (filtering students by role and sorting)
CREATE INDEX IF NOT EXISTS idx_users_role_id_full_name ON public.users(role_id, full_name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Index for announcements (filtering by published status and date)
CREATE INDEX IF NOT EXISTS idx_announcements_published_date ON public.announcements(is_published, created_at DESC);
