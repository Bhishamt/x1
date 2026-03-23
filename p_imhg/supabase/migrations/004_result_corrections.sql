-- ============================================================
-- MIGRATION 004: RESULT CORRECTION REQUESTS
-- Teachers submit corrections; Super Admin approves/rejects
-- ============================================================

CREATE TABLE IF NOT EXISTS public.result_corrections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id     UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES public.users(id),
  course_id     UUID NOT NULL REFERENCES public.courses(id),
  exam_type     TEXT NOT NULL,
  semester      SMALLINT NOT NULL,
  academic_year TEXT NOT NULL,
  old_marks     NUMERIC(5,2) NOT NULL,
  new_marks     NUMERIC(5,2) NOT NULL,
  reason        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  requested_by  UUID NOT NULL REFERENCES public.users(id),
  reviewed_by   UUID REFERENCES public.users(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corrections_status ON public.result_corrections(status);
CREATE INDEX IF NOT EXISTS idx_corrections_requested_by ON public.result_corrections(requested_by);

-- Check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'result_corrections_status_check'
  ) THEN
    ALTER TABLE public.result_corrections
      ADD CONSTRAINT result_corrections_status_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;
