-- ============================================================
-- MIGRATION 009: CREATE SUBJECTS TABLE
-- Separate from courses — individual subjects per semester
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  department  TEXT NOT NULL,
  semester    SMALLINT NOT NULL,
  scheme      TEXT NOT NULL DEFAULT 'N22',
  credits     SMALLINT NOT NULL DEFAULT 3,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code, department, semester, scheme)
);

-- Auto-update timestamp
CREATE TRIGGER subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for result entry lookups
CREATE INDEX IF NOT EXISTS idx_subjects_dept_sem_scheme
  ON public.subjects(department, semester, scheme);

-- RLS on subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view subjects
CREATE POLICY "subjects_select" ON public.subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admin/super_admin can manage subjects
CREATE POLICY "subjects_insert" ON public.subjects
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "subjects_update" ON public.subjects
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "subjects_delete" ON public.subjects
  FOR DELETE USING (public.is_admin());
