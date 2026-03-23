-- ============================================================
-- MIGRATION 003: ADD SCHEME AND MAX_MARKS TO COURSES
-- ============================================================

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS scheme TEXT DEFAULT 'N22';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS max_marks_ct NUMERIC(5,2) DEFAULT 30;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS max_marks_ht NUMERIC(5,2) DEFAULT 60;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS max_marks_final NUMERIC(5,2) DEFAULT 100;

-- Index for result entry lookup: department + semester + scheme
CREATE INDEX IF NOT EXISTS idx_courses_dept_sem_scheme
  ON public.courses(department, semester, scheme);
