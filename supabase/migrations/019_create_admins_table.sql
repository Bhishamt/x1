-- ============================================================
-- 019: DEDICATED ADMINS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admins (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL, -- 'super_admin' | 'admin' | 'hod' | 'class_incharge'
  department  TEXT,
  phone       TEXT,
  status      TEXT NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Helper to check if caller is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role_id = 1
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies for admins table
CREATE POLICY "admins_select_policy" ON public.admins
  FOR SELECT USING (auth.uid() IS NOT NULL); -- All staff can view admins

CREATE POLICY "admins_insert_policy" ON public.admins
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "admins_update_policy" ON public.admins
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "admins_delete_policy" ON public.admins
  FOR DELETE USING (public.is_super_admin());

-- Trigger for updated_at
CREATE TRIGGER admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
