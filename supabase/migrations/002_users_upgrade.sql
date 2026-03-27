-- ============================================================
-- MIGRATION 002: UPGRADE USERS TABLE
-- Adds academic_year, scheme columns
-- Adds composite unique constraint for roll numbers
-- ============================================================

-- Add new columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS scheme TEXT DEFAULT 'N22';

-- Roll number uniqueness within department + year
-- First drop the old global unique constraint on roll_no
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_roll_no_key;

-- Add composite unique (department + year + roll_no)
-- This ensures roll numbers are unique within a department+year combo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_dept_year_rollno_unique'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_dept_year_rollno_unique UNIQUE (department, year, roll_no);
  END IF;
END $$;

-- Index for fast department + year filtering
CREATE INDEX IF NOT EXISTS idx_users_dept_year ON public.users(department, year);
